import { DatasetSlice, OptimizationParameters, TensorDataset } from "./types";
import * as tf from "@tensorflow/tfjs";

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
    const preds = model(e1, e2, matrix as tf.Tensor2D, dropoutFraction);
    return mse_loss(preds, targets);
  };

// Based on the OpenAI Notebook
async function* gradientDescentOptimize(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: tf.Variable
): AsyncGenerator<number> {
  const shuffledBatchDataset = dataset.tfDataset
    .shuffle(dataset.tfDataset.size)
    .batch(parameters.batchSize);
  let bestLoss = Infinity;
  const draftMatrix = matrix.clone().variable();
  for (let epoch = 0; epoch < parameters.epochs; epoch++) {
    await shuffledBatchDataset.forEachAsync((batch) => {
      tf.tidy(() => {
        const { e1, e2, labels } = batch as DatasetSlice;
        const gradientFunction = tf.grad(
          makeWrappedLoss(parameters.dropoutFraction, e1, e2, labels)
        );
        const grad = gradientFunction(draftMatrix);
        draftMatrix.assign(draftMatrix.sub(grad.mul(parameters.learningRate)));
      });
    });
    const loss = tf.tidy(() => {
      const preds = model(
        dataset.e1,
        dataset.e2,
        draftMatrix as tf.Tensor2D,
        parameters.dropoutFraction
      );
      return mse_loss(preds, dataset.labels).dataSync()[0];
    });
    // Only modify the matrix if the loss is better
    if (loss < bestLoss) {
      bestLoss = loss;
      matrix.assign(draftMatrix);
    }
    yield epoch;
  }
  draftMatrix.dispose();
}

async function* tfOptimize(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: tf.Variable,
  optimizerType: "adamax"
): AsyncGenerator<number> {
  const shuffledBatchDataset = dataset.tfDataset
    .shuffle(dataset.tfDataset.size)
    .batch(parameters.batchSize);
  const optimizer =
    optimizerType === "adamax"
      ? tf.train.adamax(parameters.learningRate)
      : tf.train.adam(parameters.learningRate);
  for (let epoch = 0; epoch < parameters.epochs; epoch++) {
    await shuffledBatchDataset.forEachAsync((batch) => {
      const { e1, e2, labels } = batch as DatasetSlice;
      optimizer.minimize(
        () =>
          mse_loss(
            model(e1, e2, matrix as tf.Tensor2D, parameters.dropoutFraction),
            labels
          ),
        false,
        [matrix]
      );
    });
    yield epoch;
  }
}

export function makeMatrix(embeddingSize: number, targetEmbeddingSize: number) {
  return tf.randomNormal([embeddingSize, targetEmbeddingSize]).variable();
}

// We return a generator of epochs so that we can update as the matrix gets updated
export function trainMatrix(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: tf.Variable
): AsyncGenerator<number> {
  switch (parameters.optimizer) {
    case "gradient":
      return gradientDescentOptimize(dataset, parameters, matrix);
    case "adamax":
      return tfOptimize(dataset, parameters, matrix, "adamax");
  }
}
