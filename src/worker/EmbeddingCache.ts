import { Embedding, db } from "../lib/db";
import log from "loglevel";
import { EmbeddingCacheData, Pairings } from "../types";
import { chunk } from "lodash";
import { backOff } from "exponential-backoff";
import { defaultEmbeddingModel } from "../lib/const";
import { sendMessageToHost } from "./workerUtil";

export default class EmbeddingCache {
  cache: EmbeddingCacheData = {};
  constructor() {}

  addToCache(add: EmbeddingCacheData) {
    this.cache = { ...this.cache, ...add };
  }

  getCache(): EmbeddingCacheData {
    return this.cache;
  }

  getCachedEmbedding(text: string): number[] {
    if (!(text in this.cache)) {
      throw new Error(`Text not cached in embedding ${text}}`);
    }
    return this.cache[text];
  }

  async fetchEmbeddingsFromOpenAI(
    texts: string[],
    apiKey: string,
    model: string
  ): Promise<void> {
    log.info(`Fetching ${texts.length} embeddings`);

    // Keeping the requests chunked by 150 seems to help throttling
    const chunked = chunk(texts, 150);
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
      if (res.status !== 200) {
        log.error(json);
        throw new Error(`Failed to fetch embeddings: ${json.error.message}`);
      }

      // Add to DB
      const toAdd: Embedding[] = json.data.map(
        (res: { index: number; embedding: number[] }) => ({
          embedding: res.embedding,
          text: chunk[res.index],
          dateCreated: new Date(),
          model,
        })
      );
      await db.embeddings.bulkPut(toAdd);

      // Add to cache
      toAdd.forEach((res: Embedding) => {
        this.cache[res.text] = res.embedding;
      });

      // Keep the progress bar updated
      sendMessageToHost({
        type: "embeddingProgress",
        progress: i / chunked.length,
      });
    }
    log.info(`Done fetching`);
  }

  async bulkEmbed(
    pairs: Pairings,
    apiKey: string,
    model = defaultEmbeddingModel
  ): Promise<void> {
    sendMessageToHost({
      type: "embeddingProgress",
      progress: 0,
    });
    log.info("Bulk embedding...");
    // Collect all pieces of text
    const flattenedPairs = [
      ...new Set(pairs.flatMap((p) => [p.text_1, p.text_2])),
    ];
    // Look up existing text embeddings by model in the DB
    const results = await db.embeddings.bulkGet(
      flattenedPairs.map((t) => [t, model])
    );

    // Missing text will be null in the results array. Add it to the missing queue
    const missing: string[] = [];
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res) {
        this.cache[res.text] = res.embedding;
      } else {
        missing.push(flattenedPairs[i]);
      }
    }

    if (missing.length > 0) {
      await this.fetchEmbeddingsFromOpenAI(missing, apiKey, model);
    } else {
      log.info("No embeddings to fetch");
    }
  }
}
