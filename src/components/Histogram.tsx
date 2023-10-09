import Plot from "react-plotly.js";
import { CosineSimilarPairings } from "../lib/types";
export default function Histogram({
  pairings,
}: {
  pairings: CosineSimilarPairings;
}) {
  return (
    <div>
      <Plot
        layout={{ barmode: "overlay", width: 500 }}
        data={[
          {
            type: "histogram",
            name: "Positives",
            marker: { color: "blue" },
            opacity: 0.5,
            x: pairings.filter((p) => p.label === 1).map((p) => p.similarity),
          },
          {
            type: "histogram",
            name: "Negatives",
            marker: { color: "red" },
            opacity: 0.5,
            x: pairings.filter((p) => p.label === -1).map((p) => p.similarity),
          },
        ]}
      />
    </div>
  );
}
