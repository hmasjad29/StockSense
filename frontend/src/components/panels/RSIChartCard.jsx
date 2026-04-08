import { useEffect, useState } from "react";
import Card from "../layout/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RSIChartCard({ symbol }) {
  const [rsiData, setRsiData] = useState([]);

  useEffect(() => {
    async function fetchRSI() {
      if (!symbol) return;

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/indicator/${symbol}/rsi`);
        const data = await res.json();
        setRsiData(data.series || []);
      } catch (error) {
        console.error("Failed to fetch RSI:", error);
      }
    }

    fetchRSI();
  }, [symbol]);

  return (
    <Card title="RSI Indicator">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rsiData}>
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip />
            <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="value"
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



// import Card from "../layout/Card";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   ReferenceLine,
//   ResponsiveContainer,
// } from "recharts";

// const mockRSI = [
//   { time: "10:00", rsi: 45 },
//   { time: "10:05", rsi: 52 },
//   { time: "10:10", rsi: 60 },
//   { time: "10:15", rsi: 72 },
//   { time: "10:20", rsi: 68 },
// ];

// export default function RSIChartCard() {
//   return (
//     <Card title="RSI Indicator">
//       <div className="h-[180px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={mockRSI}>
//             <XAxis dataKey="time" hide />
//             <YAxis domain={[0, 100]} hide />

//             {/* Overbought line */}
//             <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />

//             {/* Oversold line */}
//             <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />

//             <Line
//               type="monotone"
//               dataKey="rsi"
//               stroke="#60a5fa"
//               strokeWidth={2}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// }