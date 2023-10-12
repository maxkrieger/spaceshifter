import Dexie, { Table } from "dexie";
import { Pairing } from "./types";

export interface Project {
  id?: number;
  name: string;
  dateCreated: Date;
}

// For now, we don't store model type
export interface Embedding {
  text: string;
  embedding: number[];
}

export type Pair = {
  id?: number;
  project: number;
  dateCreated: Date;
  forTraining?: boolean;
} & Pairing;

export class SpaceshifterDB extends Dexie {
  embedding!: Table<Embedding>;
  project!: Table<Project>;
  pair!: Table<Pair>;

  constructor() {
    super("spaceshifter");
    this.version(1).stores({
      embedding: "text, embedding",
      project: "++id, name, dateCreated",
      pair: "++id, project, dateCreated, text_1, text_2, label",
    });
  }
}

export const db = new SpaceshifterDB();
