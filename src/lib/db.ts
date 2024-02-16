import Dexie, { Table } from "dexie";
import { OptimizationParameters, Pairing } from "./types";

export interface Dataset {
  id?: number;
  name: string;
  dateCreated: Date;
  trainingParams: OptimizationParameters;
}

export interface Embedding {
  text: string;
  embedding: number[];
  dateCreated: Date;
  model: string;
}

export interface SavedMatrix {
  id?: number;
  dataset: number;
  matrix: ArrayBuffer;
  shape: [number, number];
  dateCreated: Date;
}

export type Pair = {
  id?: number;
  dataset: number;
  dateCreated: Date;
} & Pairing;

export class SpaceshifterDB extends Dexie {
  embeddings!: Table<Embedding>;
  dataset!: Table<Dataset>;
  pair!: Table<Pair>;
  savedMatrices!: Table<SavedMatrix>;

  async deleteDataset(id: number) {
    return await this.transaction(
      "rw",
      this.embeddings,
      this.pair,
      this.dataset,
      async () => {
        const pairs = await this.pair.where("dataset").equals(id).toArray();
        for await (const { text_1, text_2 } of pairs) {
          await this.embeddings.where("text").equals(text_1).delete();
          await this.embeddings.where("text").equals(text_2).delete();
        }
        await this.pair.where("dataset").equals(id).delete();
        await this.dataset.delete(id);
      }
    );
  }
  constructor() {
    super("spaceshifter");
    this.version(1).stores({
      embedding: "text, embedding, dateCreated",
      dataset: "++id, name, dateCreated, trainingParams",
      pair: "++id, dataset, dateCreated, text_1, text_2, label",
      matrix: "++id, dataset, matrix, shape, dateCreated",
    });
    this.version(2)
      .stores({
        embeddings: "[text+model], embedding, dateCreated",
        dataset: "++id, name, dateCreated, trainingParams",
        pair: "++id, dataset, dateCreated, text_1, text_2, label",
        matrix: "++id, dataset, matrix, shape, dateCreated",
      })
      .upgrade(async (trans) => {
        return trans.table("embedding").clear();
      });
  }
}

export const db = new SpaceshifterDB();
