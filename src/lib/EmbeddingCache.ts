import { db } from "./db";
import log from "loglevel";
import { Pairings } from "./types";
import { chunk } from "lodash";

class EmbeddingCache {
  cache: { [key: string]: number[] } = {};
  apiKey = null;
  constructor() {}
  private getApiKey() {
    if (this.apiKey === null) {
      const fetched = (window as any).localStorage.getItem("api-key");
      if (fetched) {
        this.apiKey = JSON.parse(fetched);
      } else {
        throw new Error("No API key set");
      }
    }
  }
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

    this.getApiKey();
    if (missing.length > 0) {
      log.info(`Fetching ${missing.length} embeddings`);
      const chunked = chunk(missing, 150);
      //   TODO: backoff
      for await (const chunk of chunked) {
        log.info(`Fetching ${chunk.length} embeddings chunk`);
        const res = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: chunk,
          }),
        });
        const json = await res.json();
        for (const embeddingRes of json.data) {
          const text = chunk[embeddingRes.index];
          const embedding = embeddingRes.embedding;
          this.cache[text] = embedding;
          await db.embedding.put({ text, embedding });
        }
      }
      log.info(`Done fetching`);
    } else {
      log.info("No embeddings to fetch");
    }
  }
}

const embeddingCache = new EmbeddingCache();
export default embeddingCache;
