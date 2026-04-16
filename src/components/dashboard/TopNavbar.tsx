import { useEffect, useState } from "react";
import { Wifi, Clock, Server, Globe } from "lucide-react";

interface Props {
  metrics: {
    cost: number;
    latency: number;
    hops: number;
    status: string;
  };
  children?: React.ReactNode;
}

const TopNavbar = ({ metrics, children }: Props) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const statusConfig = {
    Optimal: { color: "bg-neon", text: "text-neon", label: "All Systems Operational", dot: "shadow-[0_0_8px_hsl(var(--neon)/0.6)]" },
    Normal: { color: "bg-yellow-400", text: "text-yellow-400", label: "Medium Load", dot: "shadow-[0_0_8px_rgba(250,204,21,0.6)]" },
    Congested: { color: "bg-destructive", text: "text-destructive", label: "Congested", dot: "shadow-[0_0_8px_hsl(var(--destructive)/0.6)]" },
    Idle: { color: "bg-muted-foreground", text: "text-muted-foreground", label: "Idle", dot: "" },
  };

  const s = statusConfig[metrics.status as keyof typeof statusConfig] || statusConfig.Idle;

  return (
    <header
      className="h-12 flex items-center justify-between px-5 border-b border-border/20"
      style={{
        background: "linear-gradient(90deg, hsl(var(--card) / 0.3), hsl(var(--card) / 0.2))",
        backdropFilter: "blur(24px) saturate(1.2)",
      }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${s.color} ${s.dot} animate-pulse-neon`} />
          <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
        </div>
        <div className="h-4 w-px bg-border/30" />
        <div className="flex items-center gap-5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Server className="w-3 h-3" />12 Nodes</span>
          <span className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Globe className="w-3 h-3" />20 Links</span>
          <span className="flex items-center gap-1.5 transition-colors hover:text-foreground"><Wifi className="w-3 h-3" />{metrics.latency}ms</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {children}
        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {time.toLocaleTimeString("en-US", { hour12: false })} UTC
        </span>
        <span className="text-[10px] text-muted-foreground/70 px-2.5 py-1 rounded-lg border border-border/30"
          style={{ background: "hsl(var(--muted) / 0.2)" }}
        >
          v2.4.1
        </span>
      </div>
    </header>
  );
};

export default TopNavbar;
