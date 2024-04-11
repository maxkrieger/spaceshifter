import { Embedding, db } from "./db";
import log from "loglevel";
import { EmbeddingCacheData, Pairings } from "../types";
import { chunk } from "lodash";
import { backOff } from "exponential-backoff";

export default class EmbeddingCache {
  cache: EmbeddingCacheData = {};
  constructor() {}

  addToCache(add: EmbeddingCacheData) {
    this.cache = { ...this.cache, ...add };
  }
  getCache(): EmbeddingCacheData {
    return this.cache;
  }

  getEmbeddingFast(text: string): number[] {
    if (!(text in this.cache)) {
      throw new Error(`Text not cached in embedding ${text}}`);
    }
    return this.cache[text];
  }
  async bulkEmbed(
    pairs: Pairings,
    apiKey: string,
    model = "text-embedding-ada-002"
  ): Promise<void> {
    log.info("Bulk embedding...");
    const flattenedPairs = [
      ...new Set(pairs.flatMap((p) => [p.text_1, p.text_2])),
    ];
    // For compound lookup
    const results = await db.embeddings.bulkGet(
      flattenedPairs.map((t) => [t, model])
    );
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
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              input: chunk,
            }),
          })
        );
        const json = await res.json();
        const toAdd: Embedding[] = json.data.map(
          (res: { index: number; embedding: number[] }) => ({
            embedding: res.embedding,
            text: chunk[res.index],
            dateCreated: new Date(),
            model,
          })
        );
        await db.embeddings.bulkPut(toAdd);
        toAdd.forEach((res: Embedding) => {
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
