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
} & Pairing;

export class TunekitDB extends Dexie {
  embedding!: Table<Embedding>;
  project!: Table<Project>;
  pair!: Table<Pair>;

  constructor() {
    super("tunekit");
    this.version(1).stores({
      embedding: "text, embedding",
      project: "++id, name, dateCreated",
      pair: "++id, project, dateCreated, text_1, text_2, label",
    });
  }
}

export const db = new TunekitDB();
