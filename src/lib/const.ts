import { ExampleDatasetLocator } from "@/types";

export const cardStyles =
  "border bg-slate-900 border-slate-500 rounded-md p-4 my-5 max-w-4xl mx-auto";

export const datasetPanelStyles =
  "border border-slate-500 bg-slate-900 rounded-md p-4 m-2 flex-1 min-w-[300px]";

export const defaultEmbeddingModel = "text-embedding-ada-002";

export const exampleDatasets: { [id: string]: ExampleDatasetLocator } = {
  cityFacts: {
    type: "example",
    datasetURL:
      "https://gistcdn.githack.com/maxkrieger/33434e8ee941a47e921f6c5b78566d1b/raw/d76524287bcf2446ebd0f290c97090003d184ce8/cities_dataset.json",
    embeddingsURL:
      "https://gistcdn.githack.com/maxkrieger/e411a7c77b7af9c81844bb1fbcf9e117/raw/2b897bdc58433d78254de6982140945698eb74bf/cities_embeddings.json",
    name: "City Facts JSON",
  },
  mnli: {
    type: "example",
    datasetURL:
      "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_dataset.json",
    embeddingsURL:
      "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_embeddings.json",
    name: "MNLI Logical Entailment",
  },
  stackoverflow: {
    type: "example",
    datasetURL:
      "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_dataset.json",
    embeddingsURL:
      "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_embeddings.json",
    name: "StackOverflow Title and Question SQL",
  },
};
