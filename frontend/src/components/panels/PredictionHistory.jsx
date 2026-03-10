import Card from "../layout/Card";

export default function PredictionHistory({ rows }) {
  return (
    <Card title="Prediction History" right="Last 50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-white/60">
            <tr className="border-b border-white/10">
              <th className="text-left py-2">Time</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Prediction</th>
              <th className="text-left py-2">Confidence</th>
              <th className="text-left py-2">Actual</th>
              <th className="text-left py-2">Correct</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {rows.map((r, idx) => {
              const correct = r.pred === r.actual;
              const predUp = r.pred === "UP";
              return (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-2">{r.time}</td>
                  <td className="py-2">${r.price.toFixed(2)}</td>
                  <td className="py-2">
                    <span
                      className={[
                        "px-2 py-1 rounded-lg text-xs font-semibold border",
                        predUp
                          ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/10"
                          : "text-rose-300 border-rose-400/30 bg-rose-400/10",
                      ].join(" ")}
                    >
                      {r.pred}
                    </span>
                  </td>
                  <td className="py-2">{r.conf.toFixed(2)}</td>
                  <td className="py-2">{r.actual}</td>
                  <td className="py-2">
                    <span
                      className={correct ? "text-emerald-300" : "text-rose-300"}
                    >
                      {correct ? "✓" : "✗"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
