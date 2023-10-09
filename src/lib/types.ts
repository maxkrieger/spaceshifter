export type Pairing = {
  text_1: string;
  text_2: string;
  label: -1 | 1;
};

export type CosineSimilarPairing = {
  similarity: number;
} & Pairing;

export type CosineSimilarPairings = CosineSimilarPairing[];

export type Pairings = Pairing[];
