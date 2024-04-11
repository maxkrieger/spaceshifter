import { DatasetSlice, OptimizationParameters, TensorDataset } from "../types";
import {
  dropout as tf_dropout,
  tidy as tf_tidy,
  Tensor2D,
  Tensor1D,
  metrics as tf_metrics,
  Tensor,
  Scalar,
  Variable,
  grad as tf_grad,
  train as tf_train,
  randomNormal,
} from "@tensorflow/tfjs";

function model(
  e1: Tensor2D,
  e2: Tensor2D,
  matrix: Tensor2D,
  dropout_fraction: number
): Tensor1D {
  return tf_tidy(() => {
    const e1d = tf_dropout(e1, dropout_fraction);
    const e2d = tf_dropout(e2, dropout_fraction);
    const e1m = e1d.matMul(matrix);
    const e2m = e2d.matMul(matrix);
    const sim = tf_metrics.cosineProximity(e1m, e2m).mul(-1);
    return sim as Tensor1D;
  });
}

function mse_loss(preds: Tensor, targets: Tensor): Scalar {
  return preds.sub(targets).square().mean();
}

const makeWrappedLoss = (
  dropoutFraction: number,
  e1: Tensor2D,
  e2: Tensor2D,
  targets: Tensor1D
) =>
  function wrappedLoss(matrix: Tensor) {
    const preds = model(e1, e2, matrix as Tensor2D, dropoutFraction);
    return mse_loss(preds, targets);
  };

// Based on the OpenAI Notebook
async function* gradientDescentOptimize(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: Variable
): AsyncGenerator<number> {
  const shuffledBatchDataset = dataset.tfDataset
    .shuffle(dataset.tfDataset.size)
    .batch(parameters.batchSize);
  let bestLoss = Infinity;
  const draftMatrix = matrix.clone().variable();
  for (let epoch = 0; epoch < parameters.epochs; epoch++) {
    await shuffledBatchDataset.forEachAsync((batch) => {
      tf_tidy(() => {
        const { e1, e2, labels } = batch as DatasetSlice;
        const gradientFunction = tf_grad(
          makeWrappedLoss(parameters.dropoutFraction, e1, e2, labels)
        );
        const grad = gradientFunction(draftMatrix);
        draftMatrix.assign(draftMatrix.sub(grad.mul(parameters.learningRate)));
      });
    });
    const loss = tf_tidy(() => {
      const preds = model(
        dataset.e1,
        dataset.e2,
        draftMatrix as Tensor2D,
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

async function* adamaxOptimize(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: Variable
): AsyncGenerator<number> {
  const shuffledBatchDataset = dataset.tfDataset
    .shuffle(dataset.tfDataset.size)
    .batch(parameters.batchSize);
  const optimizer = tf_train.adamax(parameters.learningRate);
  for (let epoch = 0; epoch < parameters.epochs; epoch++) {
    await shuffledBatchDataset.forEachAsync((batch) => {
      const { e1, e2, labels } = batch as DatasetSlice;
      optimizer.minimize(
        () =>
          mse_loss(
            model(e1, e2, matrix as Tensor2D, parameters.dropoutFraction),
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
  return randomNormal([embeddingSize, targetEmbeddingSize]).variable();
}

// We return a generator of epochs so that we can update as the matrix gets updated
export function trainMatrix(
  dataset: TensorDataset,
  parameters: OptimizationParameters,
  matrix: Variable
): AsyncGenerator<number> {
  switch (parameters.optimizer) {
    case "gradient":
      return gradientDescentOptimize(dataset, parameters, matrix);
    case "adamax":
      return adamaxOptimize(dataset, parameters, matrix);
  }
}
