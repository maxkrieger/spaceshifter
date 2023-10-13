import { db } from "./db";
import log from "loglevel";
import { Pairings } from "./types";
import { chunk } from "lodash";
import { backOff } from "exponential-backoff";

export default class EmbeddingCache {
  cache: { [key: string]: number[] } = {};
  apiKey: string = "";
  constructor() {}

  async getEmbeddingLocally(text: string): Promise<number[] | null> {
    if (text in this.cache) {
      return this.cache[text];
    } else {
      const dbRes = await db.embedding.where("text").equals(text).first();
      if (dbRes) {
        this.cache[text] = dbRes.embedding;
        return dbRes.embedding;
      }
      return null;
    }
  }
  getEmbeddingFast(text: string): number[] {
    if (!(text in this.cache)) {
      throw new Error(`Text not cached in embedding ${text}}`);
    }
    return this.cache[text];
  }
  async bulkEmbed(pairs: Pairings): Promise<void> {
    log.info("Bulk embedding...");
    const flattenedPairs = [
      ...new Set(pairs.flatMap((p) => [p.text_1, p.text_2])),
    ];
    const results = await db.embedding.bulkGet(flattenedPairs);
    const missing = [];
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res) {
        this.cache[res.text] = res.embedding;
      } else {
        missing.push(flattenedPairs[i]);
      }
    }

    if (missing.length > 0) {
      log.info(`Fetching ${missing.length} embeddings`);
      const chunked = chunk(missing, 150);
      for (let i = 0; i < chunked.length; i++) {
        const chunk = chunked[i];
        log.info(`Fetching ${chunk.length} embeddings chunk`);
        const res = await backOff(() =>
          fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: "text-embedding-ada-002",
              input: chunk,
            }),
          })
        );
        const json = await res.json();
        const toAdd = json.data.map(
          (res: { index: number; embedding: number[] }) => ({
            embedding: res.embedding,
            text: chunk[res.index],
            dateCreated: new Date(),
          })
        );
        await db.embedding.bulkPut(toAdd);
        toAdd.forEach((res: { text: number; embedding: number[] }) => {
          this.cache[res.text] = res.embedding;
        });

        postMessage({
          type: "embeddingProgress",
          progress: i / chunked.length,
          total: missing.length,
        });
      }
      log.info(`Done fetching`);
    } else {
      log.info("No embeddings to fetch");
    }
  }
}
