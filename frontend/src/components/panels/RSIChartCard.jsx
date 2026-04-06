import Card from "../layout/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const mockRSI = [
  { time: "10:00", rsi: 45 },
  { time: "10:05", rsi: 52 },
  { time: "10:10", rsi: 60 },
  { time: "10:15", rsi: 72 },
  { time: "10:20", rsi: 68 },
];

export default function RSIChartCard() {
  return (
    <Card title="RSI Indicator">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockRSI}>
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />

            {/* Overbought line */}
            <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />

            {/* Oversold line */}
            <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />

            <Line
              type="monotone"
              dataKey="rsi"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}