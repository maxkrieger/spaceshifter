import { datasetPanelStyles } from "@/lib/const";
import { DatasetRow } from "./DatasetRow";

export default function ExampleDatasets() {
  return (
    <div className={datasetPanelStyles}>
      <div>
        <h1 className="text-xl font-bold mb-2">Example Datasets</h1>
        <hr className="border-0.5 border-slate-700" />
      </div>
      <div className="py-2">
        <DatasetRow
          name="City Facts JSON"
          locator={{
            type: "example",
            datasetURL:
              "https://gistcdn.githack.com/maxkrieger/33434e8ee941a47e921f6c5b78566d1b/raw/d76524287bcf2446ebd0f290c97090003d184ce8/cities_dataset.json",
            embeddingsURL:
              "https://gistcdn.githack.com/maxkrieger/e411a7c77b7af9c81844bb1fbcf9e117/raw/2b897bdc58433d78254de6982140945698eb74bf/cities_embeddings.json",
            name: "City Facts JSON",
          }}
        />
        <DatasetRow
          name="MNLI Logical Entailment"
          locator={{
            type: "example",
            datasetURL:
              "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_dataset.json",
            embeddingsURL:
              "https://gistcdn.githack.com/maxkrieger/42dd79326c56c1260def996f2f3a26e7/raw/0260dd24e28a171513f86756a3ac0470b4cef8f6/mnli_embeddings.json",
            name: "MNLI Logical Entailment",
          }}
        />
        <DatasetRow
          name="StackOverflow Title and Question SQL"
          locator={{
            type: "example",
            datasetURL:
              "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_dataset.json",
            embeddingsURL:
              "https://gistcdn.githack.com/maxkrieger/92e177867627e85e75b40c3733fd9ceb/raw/3cee4ff498b71ac8371e2c71bbae9df34fae958e/sql_embeddings.json",
            name: "StackOverflow Title and Question SQL",
          }}
        />
      </div>
    </div>
  );
}
