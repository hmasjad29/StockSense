import { TrendingUp, TrendingDown, Brain } from "lucide-react";
import Card from "../layout/Card";

export default function PredictionCard({ data, mlStatus, onTrain, training }) {
  const isUp = data?.direction === "UP";

  return (
    <Card title="Prediction (Next Interval)">
      <div className="flex flex-col gap-4">
        {/* Direction */}
        <div className="flex items-center justify-center gap-3 py-2">
          {isUp
            ? <TrendingUp  className="h-8 w-8 text-emerald-400" />
            : <TrendingDown className="h-8 w-8 text-rose-400" />
          }
          <div className={["text-4xl font-bold tracking-tight", isUp ? "text-emerald-400" : "text-rose-400"].join(" ")}>
            {data?.direction ?? "—"}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-white/50 mb-1">Confidence</div>
            <div className="text-white font-semibold text-lg">
              {data ? `${Math.round(data.confidence * 100)}%` : "—"}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-xs text-white/50 mb-1">Pred. Price</div>
            <div className="text-white font-semibold text-lg">
              {data ? `$${data.price.toFixed(2)}` : "—"}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 col-span-2 p-3">
            <div className="text-xs text-white/50 mb-1">Prediction Time</div>
            <div className="text-white font-semibold">{data?.time ?? "—"}</div>
          </div>
        </div>

        {/* Signals */}
        {data?.signals?.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
              Top Indicators
            </div>
            <ul className="space-y-1.5 text-sm text-white/70">
              {data.signals.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-emerald-400/60 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Model status */}
        <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3.5 w-3.5 text-white/50" />
            <span className="text-white/50">
              {mlStatus?.trained
                ? `RF Model ✓ (trained ${mlStatus.n_samples} samples)`
                : "No ML model trained yet"}
            </span>
          </div>
          <button
            onClick={onTrain}
            disabled={training}
            className={[
              "w-full rounded-lg py-2 text-xs font-semibold transition-colors",
              training
                ? "bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30",
            ].join(" ")}
          >
            {training ? "Training Random Forest…" : "🧠 Train & Predict"}
          </button>
        </div>
      </div>
    </Card>
  );
}
