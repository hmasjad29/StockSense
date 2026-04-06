import Card from "../layout/Card";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
} from "recharts";

const mockMACD = [
  { time: "10:00", macd: -0.5, signal: -0.6 },
  { time: "10:05", macd: -0.2, signal: -0.4 },
  { time: "10:10", macd: 0.1, signal: -0.1 },
  { time: "10:15", macd: 0.4, signal: 0.2 },
  { time: "10:20", macd: 0.3, signal: 0.25 },
];

export default function MACDChartCard() {
  return (
    <Card title="MACD Indicator">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockMACD}>
            <XAxis dataKey="time" hide />

            <Line
              type="monotone"
              dataKey="macd"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="signal"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
