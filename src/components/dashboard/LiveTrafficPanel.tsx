import { useEffect, useState } from "react";
import { Activity, ArrowUpRight } from "lucide-react";

interface TrafficEvent {
  id: number;
  from: string;
  to: string;
  latency: number;
  status: "ok" | "slow" | "error";
  time: string;
}

const cities = ["NYC", "LON", "TKY", "SFO", "FRA", "SIN", "SYD", "DXB", "SAO", "MUM", "SEA", "HKG"];

const LiveTrafficPanel = () => {
  const [events, setEvents] = useState<TrafficEvent[]>([]);

  useEffect(() => {
    const addEvent = () => {
      const from = cities[Math.floor(Math.random() * cities.length)];
      let to = from;
      while (to === from) to = cities[Math.floor(Math.random() * cities.length)];
      const latency = Math.round(5 + Math.random() * 80);
      const status = latency < 30 ? "ok" : latency < 60 ? "slow" : "error";
      setEvents(prev => [{
        id: Date.now(),
        from, to, latency, status,
        time: new Date().toLocaleTimeString("en-US", { hour12: false })
      }, ...prev.slice(0, 19)]);
    };

    addEvent();
    const interval = setInterval(addEvent, 2000 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  const statusStyles: Record<string, React.CSSProperties> = {
    ok: { color: "hsl(var(--neon))", background: "hsl(var(--neon) / 0.08)", border: "1px solid hsl(var(--neon) / 0.15)" },
    slow: { color: "hsl(45 95% 60%)", background: "hsl(45 95% 60% / 0.08)", border: "1px solid hsl(45 95% 60% / 0.15)" },
    error: { color: "hsl(var(--destructive))", background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.15)" },
  };

  return (
    <div className="glass-card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--neon) / 0.15), hsl(var(--neon) / 0.05))",
              border: "1px solid hsl(var(--neon) / 0.2)",
            }}
          >
            <Activity className="w-3.5 h-3.5 text-neon" />
          </div>
          <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">Live Traffic</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neon font-medium tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-neon" style={{ boxShadow: "0 0 6px hsl(var(--neon) / 0.5)" }} />
          Streaming
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
        {events.map((e, i) => (
          <div
            key={e.id}
            className="traffic-row animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-foreground/80 text-[11px]">{e.from}</span>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground/40" />
              <span className="font-mono text-foreground/80 text-[11px]">{e.to}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]" style={{ color: statusStyles[e.status].color }}>{e.latency}ms</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-semibold tracking-wider"
                style={statusStyles[e.status]}
              >
                {e.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTrafficPanel;
