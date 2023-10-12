import Dexie, { Table } from "dexie";
import { OptimizationParameters, Pairing } from "./types";

export interface Dataset {
  id?: number;
  name: string;
  dateCreated: Date;
  trainingParams: OptimizationParameters;
}

// For now, we don't store model type
export interface Embedding {
  text: string;
  embedding: number[];
  dateCreated: Date;
}

export interface SavedMatrix {
  id?: number;
  dataset: number;
  matrix: number[][];
  dateCreated: Date;
}

export type Pair = {
  id?: number;
  dataset: number;
  dateCreated: Date;
} & Pairing;

export class SpaceshifterDB extends Dexie {
  embedding!: Table<Embedding>;
  dataset!: Table<Dataset>;
  pair!: Table<Pair>;
  savedMatrices!: Table<SavedMatrix>;

  constructor() {
    super("spaceshifter");
    this.version(1).stores({
      embedding: "text, embedding, dateCreated",
      dataset: "++id, name, dateCreated, trainingParams",
      pair: "++id, dataset, dateCreated, text_1, text_2, label",
      matrix: "++id, dataset, matrix, dateCreated",
    });
  }
}

export const db = new SpaceshifterDB();
