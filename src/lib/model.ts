// Get openai keys for localstorage
// Make a project
// Make embeddings
//  Train

import embeddingCache from "./embeddingCache";
import { EmbeddedPairing, Pairings } from "./types";
import * as tf from "@tensorflow/tfjs";

function model(
  e1: tf.Tensor2D,
  e2: tf.Tensor2D,
  matrix: tf.Tensor2D,
  dropout_fraction: number
): tf.Tensor1D {
  const e1d = tf.dropout(e1, dropout_fraction);
  const e2d = tf.dropout(e2, dropout_fraction);
  //   TODO: right order of ops?
  const e1m = e1d.matMul(matrix);
  const e2m = e2d.matMul(matrix);
  //   const sim = tf.losses.cosineDistance(e1m, e2m, 0);
  const sim = tf.metrics.cosineProximity(e1m, e2m).mul(-1);
  return sim as tf.Tensor1D;
}

async function embeddingTensorsFromPairings(
  pairings: Pairings
): Promise<tf.data.Dataset<tf.TensorContainer>> {
  const e1s = [];
  const e2s = [];
  const s = [];
  for (const { text_1, text_2, label } of pairings) {
    const e1 = (await embeddingCache.getEmbeddingLocally(text_1))!;
    const e2 = (await embeddingCache.getEmbeddingLocally(text_2))!;
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

async function foofoooo(
  pairings: Pairings
): Promise<{ e1: tf.Tensor2D; e2: tf.Tensor2D; label: tf.Tensor1D }> {
  const e1s = [];
  const e2s = [];
  const s = [];
  for (const { text_1, text_2, label } of pairings) {
    const e1 = (await embeddingCache.getEmbeddingLocally(text_1))!;
    const e2 = (await embeddingCache.getEmbeddingLocally(text_2))!;
    e1s.push(e1);
    e2s.push(e2);
    s.push(label);
  }
  return {
    e1: tf.tensor2d(e1s),
    e2: tf.tensor2d(e2s),
    label: tf.tensor1d(s),
  };
}

function mse_loss(preds: tf.Tensor, targets: tf.Tensor): tf.Scalar {
  return preds.sub(targets).square().mean();
}

export async function* trainMatrix(
  train: Pairings,
  test: Pairings,
  learningRate: number = 1,
  epochs: number = 100,
  dropoutFraction: number = 0.2,
  batchSize = 100,
  embeddingSize = 1536
): AsyncGenerator<tf.Tensor2D> {
  console.log(test);
  const trainSet = (await embeddingTensorsFromPairings(train)).batch(batchSize);
  const testSet = await foofoooo(test);
  const optimizer = tf.train.adamax(learningRate);
  const matrix = tf.randomNormal([embeddingSize, embeddingSize]).variable();
  for (let epoch = 0; epoch < epochs; epoch++) {
    // batch it in a loop here, don't use e1train directly
    await trainSet.forEachAsync((batch) => {
      const { e1, e2, label } = batch as EmbeddedPairing;
      optimizer.minimize(
        () =>
          mse_loss(
            model(e1, e2, matrix as tf.Tensor2D, dropoutFraction),
            label
          ),
        false,
        [matrix]
      );
      //   console.log(
      //     "train",
      //     mse_loss(
      //       model(e1, e2, matrix as tf.Tensor2D, dropoutFraction),
      //       label
      //     ).arraySync()
      //   );
      //   console.log(
      //     "teset",
      //     mse_loss(
      //       model(testSet.e1, testSet.e2, matrix as tf.Tensor2D, 0),
      //       testSet.label
      //     ).arraySync()
      //   );
    });

    yield matrix as tf.Tensor2D;
  }
}
