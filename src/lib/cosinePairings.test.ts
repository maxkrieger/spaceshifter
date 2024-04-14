import { expect, test } from "vitest";
import computeCosinePairings from "./cosinePairings";
import { exampleDatasets } from "./const";
import citiesCosinePairingsGroundtruth from "../../test/fixtures/cities_cosine_pairings.json";
import pairingToDataset from "./pairingToDataset";
import EmbeddingCache from "@/worker/EmbeddingCache";

const cityFactsDataset = exampleDatasets.cityFacts;

test(
  "computeCosinePairings should produce groundtruth cosine values within 5 decimal places",
  async () => {
    const cityFactsPairingsResult = await fetch(cityFactsDataset.datasetURL);
    const cityFactsPairings = await cityFactsPairingsResult.json();
    const cityFactsEmbeddingsResult = await fetch(
      cityFactsDataset.embeddingsURL
    );
    const cityFactsEmbeddings = await cityFactsEmbeddingsResult.json();
    const embeddingCache = new EmbeddingCache();
    embeddingCache.addToCache(cityFactsEmbeddings);

    const tensorDataset = pairingToDataset(cityFactsPairings, embeddingCache);
    const cosinePairings = await computeCosinePairings(tensorDataset);
    for (let i = 0; i < cosinePairings.length; i++) {
      expect(
        cosinePairings[i][0],
        `cosinePairings[${i}] is within 5 decimal places of groundtruth`
      ).toBeCloseTo(citiesCosinePairingsGroundtruth[i][0], 5);
    }
  },
  { timeout: 15000 }
);
