import Plot from "react-plotly.js";
import { CosinePairings } from "../lib/types";
export default function Histogram({ pairings }: { pairings: CosinePairings }) {
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
            x: pairings
              .filter(([, label]) => label === 1)
              .map(([similarity]) => similarity),
          },
          {
            type: "histogram",
            name: "Negatives",
            marker: { color: "red" },
            opacity: 0.5,
            x: pairings
              .filter(([, label]) => label === -1)
              .map(([similarity]) => similarity),
          },
        ]}
      />
    </div>
  );
}
