import Card from "../layout/Card";

export default function PredictionCard({ data }) {
  const isUp = data.direction === "UP";
  return (
    <Card title="Prediction (Next Interval)">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-center gap-3">
          <div
            className={[
              "text-5xl font-bold",
              isUp ? "text-emerald-400" : "text-rose-400",
            ].join(" ")}
          >
            {data.direction}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-white/60">Confidence</div>
            <div className="text-white font-semibold">
              {Math.round(data.confidence * 100)}%
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="text-white/60">Price</div>
            <div className="text-white font-semibold">
              ${data.price.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 col-span-2">
            <div className="text-white/60">Prediction Time</div>
            <div className="text-white font-semibold">{data.time}</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-white/80 mb-2">
            Top Indicators
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            {data.signals.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-white/40">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
