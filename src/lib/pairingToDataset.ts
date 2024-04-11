import { Pairings, TensorDataset } from "../types";
import EmbeddingCache from "./EmbeddingCache";
import { data as tf_data, tensor1d, tensor2d } from "@tensorflow/tfjs";

export default function pairingToDataset(
  pairings: Pairings,
  embeddingCache: EmbeddingCache
): TensorDataset {
  const e1s = [];
  const e2s = [];
  const labels = [];
  for (const { text_1, text_2, label } of pairings) {
    const e1 = embeddingCache.getEmbeddingFast(text_1);
    const e2 = embeddingCache.getEmbeddingFast(text_2);
    e1s.push(e1);
    e2s.push(e2);
    labels.push(label);
  }
  // We (redundantly) allocate tensors for the loss function and datasets for the training
  const e1Tensor = tensor2d(e1s);
  const e2Tensor = tensor2d(e2s);
  const labelsTensor = tensor1d(labels);
  const e1Dataset = tf_data.array(e1s);
  const e2Dataset = tf_data.array(e2s);
  const labelsDataset = tf_data.array(labels);
  const dataset = tf_data.zip({
    e1: e1Dataset,
    e2: e2Dataset,
    labels: labelsDataset,
  });
  const embeddingSize = e1Tensor.shape[1];
  return {
    e1: e1Tensor,
    e2: e2Tensor,
    labels: labelsTensor,
    embeddingSize,
    tfDataset: dataset,
  };
}
