import { useState } from "react";
import { Network, Zap, Loader2, ArrowRight } from "lucide-react";

interface Props {
  nodes: { id: string; label: string }[];
  onFindRoute: (source: string, dest: string) => void;
  isLoading: boolean;
  path: string[];
  metrics: { cost: number; latency: number; hops: number; status: string };
}

const RoutePanel = ({ nodes, onFindRoute, isLoading, path, metrics }: Props) => {
  const [source, setSource] = useState("");
  const [dest, setDest] = useState("");
  const [ripple, setRipple] = useState(false);

  const nodeLabel = (id: string) => nodes.find(n => n.id === id)?.label || id;

  const handleClick = () => {
    if (!source || !dest || isLoading) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    onFindRoute(source, dest);
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--neon) / 0.15), hsl(var(--neon) / 0.05))",
            border: "1px solid hsl(var(--neon) / 0.2)",
          }}
        >
          <Network className="w-3.5 h-3.5 text-neon" />
        </div>
        <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">Route Configuration</h3>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
        <div>
          <label className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] mb-1.5 block font-medium">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full select-premium focus-glow"
          >
            <option value="">Select...</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40 mb-3" />
        <div>
          <label className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] mb-1.5 block font-medium">Destination</label>
          <select
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full select-premium focus-glow"
          >
            <option value="">Select...</option>
            {nodes.filter(n => n.id !== source).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
          </select>
        </div>
      </div>

      <button
        className={`btn-neon relative flex items-center justify-center gap-2 py-2.5 text-xs overflow-hidden ${ripple ? 'animate-ripple-btn' : ''}`}
        disabled={!source || !dest || isLoading}
        onClick={handleClick}
      >
        {ripple && (
          <span className="absolute inset-0 animate-ripple-ring rounded-xl pointer-events-none" />
        )}
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
        {isLoading ? "Computing..." : "Find Optimal Route"}
      </button>

      {path.length > 0 && (
        <div className="border-t border-border/20 pt-4 animate-fade-in">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] mb-2.5 font-medium">Computed Path</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {path.map((id, i) => (
              <span key={id} className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                <span className="text-xs font-mono font-medium text-neon px-2.5 py-1 rounded-lg"
                  style={{
                    background: "hsl(var(--neon) / 0.08)",
                    border: "1px solid hsl(var(--neon) / 0.2)",
                  }}
                >
                  {nodeLabel(id)}
                </span>
                {i < path.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Cost", value: metrics.cost, color: "--neon" },
              { label: "Latency", value: `${metrics.latency}ms`, color: "--neon-blue" },
              { label: "Hops", value: metrics.hops, color: "--neon-purple" },
            ].map(m => (
              <div key={m.label} className="text-center p-2.5 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                style={{
                  background: "hsl(var(--muted) / 0.2)",
                  border: "1px solid hsl(var(--border) / 0.2)",
                }}
              >
                <p className="text-[10px] text-muted-foreground/60 mb-0.5">{m.label}</p>
                <p className="text-sm font-heading font-bold" style={{ color: `hsl(var(${m.color}))` }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePanel;
