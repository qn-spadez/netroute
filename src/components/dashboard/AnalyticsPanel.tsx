import { DollarSign, Clock, GitBranch, Activity, Wifi, Server } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import MetricCard from "./MetricCard";
import { networkNodes } from "@/lib/graph-data";
import { useState, useEffect } from "react";

interface Metrics {
  cost: number;
  latency: number;
  hops: number;
  status: string;
}

interface Props {
  metrics: Metrics;
  chartData: { time: string; latency: number; traffic: number }[];
}

const PIE_COLORS = ["#00ff9c", "#4da6ff", "#a855f7", "#facc15", "#f97316", "#ec4899"];

const tooltipStyle = {
  backgroundColor: "rgba(10,15,28,0.95)",
  border: "1px solid #00ff9c",
  borderRadius: "12px",
  backdropFilter: "blur(16px)",
  fontSize: "11px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  padding: "10px 14px",
  color: "#e5e7eb",
};

const tooltipLabelStyle = { color: "#ffffff", fontWeight: 600 };
const tooltipItemStyle = { color: "#e5e7eb" };

const AnalyticsPanel = ({ metrics, chartData }: Props) => {
  const [nodeTraffic, setNodeTraffic] = useState(() => generateNodeTraffic());
  const [pieData, setPieData] = useState(() => generatePieData());

  useEffect(() => {
    const interval = setInterval(() => {
      setNodeTraffic(generateNodeTraffic());
      setPieData(generatePieData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-1">
      <h2 className="font-heading text-base font-semibold text-foreground tracking-tight">Analytics & Metrics</h2>

      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard icon={DollarSign} label="Total Cost" value={metrics.cost} color="neon" />
        <MetricCard icon={Clock} label="Latency" value={metrics.latency} suffix="ms" color="blue" threshold={{ good: 35, moderate: 60 }} />
        <MetricCard icon={GitBranch} label="Hops Count" value={metrics.hops} color="purple" />
        <MetricCard icon={Activity} label="Packet Loss" value={Math.round(Math.random() * 5)} suffix="%" status={metrics.status} threshold={{ good: 2, moderate: 4 }} />
      </div>

      {/* Live Latency Chart */}
      <div className="glass-card p-4">
        <h3 className="font-heading text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-neon" />
          Live Latency
        </h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff9c" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00ff9c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,160,255,0.06)" />
              <XAxis dataKey="time" tick={{ fill: "rgba(150,170,200,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(150,170,200,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
              <Area type="monotone" dataKey="latency" stroke="#00ff9c" fill="url(#latGrad)" strokeWidth={2} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Node Traffic Bar Chart */}
      <div className="glass-card p-4">
        <h3 className="font-heading text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-neon-blue" />
          Node Traffic Load
        </h3>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nodeTraffic}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,160,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(150,170,200,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(150,170,200,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
              <Bar dataKey="load" animationDuration={800} radius={[4, 4, 0, 0]}>
                {nodeTraffic.map((entry, i) => (
                  <Cell key={i} fill={entry.load > 70 ? "#ef4444" : entry.load > 40 ? "#facc15" : "#00ff9c"} fillOpacity={0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Distribution Pie */}
      <div className="glass-card p-4">
        <h3 className="font-heading text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-neon-purple" />
          Traffic Distribution
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                dataKey="value"
                nameKey="name"
                animationDuration={800}
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.75} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
          {pieData.map((d, i) => (
            <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              {d.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

function generateNodeTraffic() {
  return networkNodes.slice(0, 8).map((n) => ({
    name: n.label,
    load: Math.round(10 + Math.random() * 80),
  }));
}

function generatePieData() {
  const categories = ["HTTP", "DNS", "TCP", "UDP", "ICMP", "Other"];
  return categories.map((name) => ({ name, value: Math.round(5 + Math.random() * 40) }));
}

export default AnalyticsPanel;
