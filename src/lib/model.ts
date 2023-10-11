// Get openai keys for localstorage
// Make a project
// Make embeddings
//  Train

import embeddingCache from "./embeddingCache";
import { EmbeddedPairing, Pairings } from "./types";
import * as tf from "@tensorflow/tfjs";

async function embeddingTensorsFromPairings(
  pairings: Pairings
): Promise<tf.data.Dataset<tf.TensorContainer>> {
  const e1s = [];
  const e2s = [];
  const s = [];
  for (const { text_1, text_2, label } of pairings) {
    const e1 = embeddingCache.getEmbeddingFast(text_1);
    const e2 = embeddingCache.getEmbeddingFast(text_2);
    e1s.push(e1);
    e2s.push(e2);
    s.push(label);
  }
  const e1D = tf.data.array(e1s);
  const e2D = tf.data.array(e2s);
  const sD = tf.data.array(s);
  const dataset = tf.data.zip({ e1: e1D, e2: e2D, label: sD });
  return dataset;
}

function model(
  e1: tf.Tensor2D,
  e2: tf.Tensor2D,
  matrix: tf.Tensor2D,
  dropout_fraction: number
): tf.Tensor1D {
  return tf.tidy(() => {
    const e1d = tf.dropout(e1, dropout_fraction);
    const e2d = tf.dropout(e2, dropout_fraction);
    const e1m = e1d.matMul(matrix);
    const e2m = e2d.matMul(matrix);
    const sim = tf.metrics.cosineProximity(e1m, e2m).mul(-1);
    return sim as tf.Tensor1D;
  });
}

function mse_loss(preds: tf.Tensor, targets: tf.Tensor): tf.Scalar {
  return preds.sub(targets).square().mean();
}

const makeWrappedLoss = (
  dropoutFraction: number,
  e1: tf.Tensor2D,
  e2: tf.Tensor2D,
  targets: tf.Tensor1D
) =>
  function wrappedLoss(matrix: tf.Tensor) {
    return tf.tidy(() => {
      const preds = model(e1, e2, matrix as tf.Tensor2D, dropoutFraction);
      return mse_loss(preds, targets);
    });
  };

function gradientDescentOptimize(
  dropoutFraction: number,
  trainSet: tf.data.Dataset<tf.TensorContainer>,
  learningRate: number,
  matrix: tf.Variable
) {
  return trainSet.forEachAsync((batch) => {
    tf.tidy(() => {
      const { e1, e2, label } = batch as EmbeddedPairing;
      const gradientFunction = tf.valueAndGrad(
        makeWrappedLoss(dropoutFraction, e1, e2, label)
      );
      const { grad, value } = gradientFunction(matrix);

      matrix.assign(matrix.sub(grad.mul(learningRate)));
    });
  });
}

function tfOptimize(
  dropoutFraction: number,
  trainSet: tf.data.Dataset<tf.TensorContainer>,
  optimizer: tf.Optimizer,
  matrix: tf.Variable
) {
  return trainSet.forEachAsync((batch) => {
    const { e1, e2, label } = batch as EmbeddedPairing;
    optimizer.minimize(
      () =>
        mse_loss(model(e1, e2, matrix as tf.Tensor2D, dropoutFraction), label),
      false,
      [matrix]
    );
  });
}

export async function* trainMatrix(
  train: Pairings,
  learningRate: number = 0.01,
  epochs: number = 100,
  dropoutFraction: number = 0.2,
  batchSize = 100,
  embeddingSize = 1536
): AsyncGenerator<tf.Tensor2D> {
  const trainSet = (await embeddingTensorsFromPairings(train)).batch(batchSize);

  // Optimizing this!
  const matrix = tf.randomNormal([embeddingSize, embeddingSize]).variable();
  // TODO: include epochs and matrix in matrix opt
  for (let epoch = 0; epoch < epochs; epoch++) {
    /*await gradientDescentOptimize(
      dropoutFraction,
      trainSet,
      learningRate,
      matrix
    );*/
    const optimizer = tf.train.adamax(learningRate);
    await tfOptimize(dropoutFraction, trainSet, optimizer, matrix);

    yield matrix as tf.Tensor2D;
  }
}
