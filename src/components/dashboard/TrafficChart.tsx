import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  time: string;
  latency: number;
  traffic: number;
}

interface Props {
  data: DataPoint[];
}

const TrafficChart = ({ data }: Props) => {
  return (
    <div className="glass-card p-5">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Network Performance</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff9c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00ff9c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4da6ff" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4da6ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,160,255,0.08)" />
            <XAxis dataKey="time" tick={{ fill: "rgba(150,170,200,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(150,170,200,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10,15,28,0.95)",
                border: "1px solid #00ff9c",
                borderRadius: "12px",
                backdropFilter: "blur(16px)",
                fontSize: "12px",
                padding: "10px 14px",
                color: "#e5e7eb",
              }}
              labelStyle={{ color: "#ffffff", fontWeight: 600 }}
              itemStyle={{ color: "#e5e7eb" }}
            />
            <Area type="monotone" dataKey="latency" stroke="#00ff9c" fill="url(#neonGrad)" strokeWidth={2} name="Latency (ms)" />
            <Area type="monotone" dataKey="traffic" stroke="#4da6ff" fill="url(#blueGrad)" strokeWidth={2} name="Traffic Load" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;
