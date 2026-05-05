import Card from "../layout/Card";

export default function FeatureImportance({ items }) {
  const sorted = [...(items ?? [])].sort((a, b) => b.value - a.value).slice(0, 7);
  return (
    <Card title="Feature Importance">
      <div className="text-xs text-white/40 mb-3">Top features influencing prediction</div>
      <div className="space-y-3">
        {sorted.map((it) => {
          const pct = Math.round(it.value * 100);
          return (
            <div key={it.name}>
              <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                <span>{it.name}</span>
                <span className="text-white/50 text-xs">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
