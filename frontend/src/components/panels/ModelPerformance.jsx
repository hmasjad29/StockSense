import Card from "../layout/Card";

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-2xl font-semibold text-white">
        {Math.round(value * 100)}%
      </div>
    </div>
  );
}

export default function ModelPerformance({ data }) {
  return (
    <Card title="Model Performance" right="Last 50">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Accuracy" value={data.accuracy} />
        <Metric label="Precision" value={data.precision} />
        <Metric label="Recall" value={data.recall} />
        <Metric label="F1 Score" value={data.f1} />
      </div>

      <div className="mt-4 text-sm text-white/70">
        <span className="text-white/50">Validation Method:</span>{" "}
        <span className="font-medium text-white/85">{data.validation}</span>
      </div>
    </Card>
  );
}
