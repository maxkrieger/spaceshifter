import { Tensor1D, Tensor2D TensorContainerObject } from "@tensorflow/tfjs";
export type Pairing = {
  text_1: string;
  text_2: string;
  label: -1 | 1;
};

export interface EmbeddedPairing extends TensorContainerObject {
  e1: Tensor2D;
  e2: Tensor2D;
  label: Tensor1D;
}

export type CosineSimilarPairing = {
  similarity: number;
} & Pairing;

export type CosineSimilarPairings = CosineSimilarPairing[];

export type Pairings = Pairing[];
