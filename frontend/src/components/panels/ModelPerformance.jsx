import Card from "../layout/Card";

function Metric({ label, value }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{pct}%</div>
      <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-400/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ModelPerformance({ data }) {
  return (
    <Card title="Model Performance" right="Random Forest">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Accuracy"  value={data?.accuracy}  />
        <Metric label="Precision" value={data?.precision} />
        <Metric label="Recall"    value={data?.recall}    />
        <Metric label="F1 Score"  value={data?.f1}        />
      </div>
      <div className="mt-4 text-sm text-white/70">
        <span className="text-white/40">Validation Method:</span>{" "}
        <span className="font-medium text-white/80">{data?.validation ?? "Time-series split"}</span>
      </div>
      {data?.n_samples && (
        <div className="mt-1 text-xs text-white/40">
          Trained on {data.n_samples.toLocaleString()} samples
        </div>
      )}
    </Card>
  );
}
