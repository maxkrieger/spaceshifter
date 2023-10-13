import { PerformanceHistory } from "@/lib/types";
import { range } from "lodash";
import Plot from "react-plotly.js";

export default function LossCurve({
  performanceHistory,
}: {
  performanceHistory: PerformanceHistory;
}) {
  const xs = range(0, performanceHistory.length);
  return (
    <div>
      <Plot
        config={{ responsive: true }}
        data={[
          {
            mode: "lines",
            type: "scatter",
            x: xs,
            name: "Test",
            y: performanceHistory.map(({ test }) => test.accuracy),
          },
          {
            mode: "lines",
            type: "scatter",
            x: xs,
            name: "Train",
            y: performanceHistory.map(({ train }) => train.accuracy),
          },
        ]}
        layout={{
          font: {
            color: "white",
          },
          height: 200,
          width: 400,
          plot_bgcolor: "rgba(255,255,255,0.25)",
          paper_bgcolor: "transparent",
          showlegend: true,
          margin: { l: 50, t: 0, r: 0, b: 50 },
          xaxis: {
            title: "Epoch",
          },
          yaxis: {
            title: "Accuracy",
            range: [0, 1],
          },
        }}
      />
    </div>
  );
}
