import { db } from "./db";
import log from "loglevel";
import { Pairings } from "./types";
import { chunk } from "lodash";
import { Tensor1D, tensor1d } from "@tensorflow/tfjs";

class EmbeddingCache {
  cache: { [key: string]: Tensor1D } = {};
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
  async getEmbeddingLocally(text: string): Promise<Tensor1D | null> {
    if (text in this.cache) {
      return this.cache[text];
    } else {
      const dbRes = await db.embedding.where("text").equals(text).first();
      if (dbRes) {
        const tens = tensor1d(dbRes.embedding);
        this.cache[text] = tens;
        return tens;
      }
      return null;
    }
  }
  async bulkEmbed(pairs: Pairings): Promise<void> {
    log.info("Bulk embedding...");
    const toFetch = new Set<string>();
    await Promise.all(
      pairs.map(async ({ text_1, text_2 }) => {
        if (!toFetch.has(text_1)) {
          if ((await this.getEmbeddingLocally(text_1)) === null) {
            toFetch.add(text_1);
          }
        }
        if (!toFetch.has(text_2)) {
          if ((await this.getEmbeddingLocally(text_2)) === null) {
            toFetch.add(text_2);
          }
        }
      })
    );

    this.getApiKey();
    if (toFetch.size > 0) {
      const toFetchAsArray = [...toFetch];
      log.info(`Fetching ${toFetchAsArray.length} embeddings`);
      const chunked = chunk(toFetchAsArray, 2);
      //   TODO: backoff
      //   await Promise.all(
      // chunked.map(async (chunk) => {
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
          const tens = tensor1d(embedding);
          this.cache[text] = tens;
          await db.embedding.put({ text, embedding });
        }
      }
      // })
      //   );
      log.info(`Done fetching`);
    } else {
      log.info("No embeddings to fetch");
    }
  }
}

const embeddingCache = new EmbeddingCache();
export default embeddingCache;
