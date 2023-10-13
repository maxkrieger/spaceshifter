import Plot from "react-plotly.js";
import { Data } from "plotly.js";
import { CosinePairings } from "../lib/types";
function makeDataset(pairings: CosinePairings, id: number): Data[] {
  return [
    {
      type: "histogram",
      name: "Positive",
      marker: { color: "blue" },
      opacity: 0.5,
      xaxis: "x",
      yaxis: "y" + id,
      legendgroup: "positives",
      showlegend: id < 2,
      x: pairings
        .filter(([, label]) => label === 1)
        .map(([similarity]) => similarity),
    },
    {
      type: "histogram",
      name: "Negative",
      marker: { color: "red" },
      opacity: 0.5,
      xaxis: "x",
      yaxis: "y" + id,
      legendgroup: "negatives",
      showlegend: id < 2,
      x: pairings
        .filter(([, label]) => label === -1)
        .map(([similarity]) => similarity),
    },
  ];
}
export default function Histogram({
  testPairings,
  trainPairings,
}: {
  testPairings: CosinePairings;
  trainPairings: CosinePairings;
}) {
  return (
    // <div className="flex justify-center">
    <div className="flex justify-center p-4">
      <Plot
        config={{ responsive: true }}
        layout={{
          plot_bgcolor: "rgba(255,255,255,0.25)",
          paper_bgcolor: "transparent",
          font: {
            color: "white",
          },
          showlegend: true,
          height: 300,
          width: 400,
          legend: {
            // tracegroupgap: 0,
            // x: 0,
            // y: 0,
          },
          barmode: "overlay",
          yaxis: {
            title: "Test Set",
          },
          yaxis2: {
            title: "Train Set",
          },
          xaxis: {
            title: "Cosine Similarity",
          },
          margin: { l: 50, t: 0, r: 0, b: 50 },
          grid: {
            rows: 2,
            columns: 1,
            subplots: ["x1y", "x2y"],
          },
        }}
        data={[
          ...makeDataset(testPairings, 1),
          ...makeDataset(trainPairings, 2),
        ]}
      />
    </div>
  );
}
