import { useEffect, useState } from "react";
import Card from "../layout/Card";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

export default function MACDChartCard({ symbol }) {
  const [macdData, setMacdData] = useState([]);

  useEffect(() => {
    async function fetchMACD() {
      if (!symbol) return;

      try {
        const res = await fetch(`http://127.0.0.1:8000/api/indicator/${symbol}/macd`);
        const data = await res.json();
        setMacdData(data.series || []);
      } catch (error) {
        console.error("Failed to fetch MACD:", error);
      }
    }

    fetchMACD();
  }, [symbol]);

  return (
    <Card title="MACD Indicator">
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={macdData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip />
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




// import Card from "../layout/Card";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   ResponsiveContainer,
// } from "recharts";

// const mockMACD = [
//   { time: "10:00", macd: -0.5, signal: -0.6 },
//   { time: "10:05", macd: -0.2, signal: -0.4 },
//   { time: "10:10", macd: 0.1, signal: -0.1 },
//   { time: "10:15", macd: 0.4, signal: 0.2 },
//   { time: "10:20", macd: 0.3, signal: 0.25 },
// ];

// export default function MACDChartCard() {
//   return (
//     <Card title="MACD Indicator">
//       <div className="h-[180px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={mockMACD}>
//             <XAxis dataKey="time" hide />

//             <Line
//               type="monotone"
//               dataKey="macd"
//               stroke="#34d399"
//               strokeWidth={2}
//               dot={false}
//             />

//             <Line
//               type="monotone"
//               dataKey="signal"
//               stroke="#facc15"
//               strokeWidth={2}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </Card>
//   );
// }
