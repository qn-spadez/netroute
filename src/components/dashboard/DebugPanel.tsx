import { Bug, GitBranch, Weight } from "lucide-react";

interface Node { id: string; label: string; x: number; y: number; }
interface Edge { from: string; to: string; weight: number; }

interface Props {
  nodes: Node[];
  edges: Edge[];
  path: string[];
  metrics: { cost: number; latency: number; hops: number; status: string };
  algorithmSteps: string[];
}

const DebugPanel = ({ nodes, edges, path, metrics, algorithmSteps }: Props) => {
  const sortedEdges = [...edges].sort((a, b) => b.weight - a.weight);
  const avgWeight = edges.length ? (edges.reduce((s, e) => s + e.weight, 0) / edges.length).toFixed(1) : "0";
  const maxWeight = edges.length ? Math.max(...edges.map((e) => e.weight)) : 0;
  const minWeight = edges.length ? Math.min(...edges.map((e) => e.weight)) : 0;

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--destructive) / 0.2), hsl(var(--destructive) / 0.05))",
            border: "1px solid hsl(var(--destructive) / 0.3)",
          }}
        >
          <Bug className="w-3.5 h-3.5 text-destructive" />
        </div>
        <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">
          Debug Mode
        </h3>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/30">
          DEV
        </span>
      </div>

      {/* Edge Weight Stats */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] font-medium flex items-center gap-1.5">
          <Weight className="w-3 h-3" /> Edge Weights
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Min", value: minWeight, color: "text-neon" },
            { label: "Avg", value: avgWeight, color: "text-neon-blue" },
            { label: "Max", value: maxWeight, color: "text-destructive" },
          ].map((s) => (
            <div
              key={s.label}
              className="p-2 rounded-lg text-center"
              style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.2)" }}
            >
              <p className="text-[9px] text-muted-foreground/60">{s.label}</p>
              <p className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top congested edges */}
        <div className="max-h-28 overflow-y-auto space-y-1">
          {sortedEdges.slice(0, 6).map((e, i) => {
            const pct = maxWeight > 0 ? (e.weight / maxWeight) * 100 : 0;
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-[10px] px-2 py-1 rounded-lg"
                style={{ background: "hsl(var(--muted) / 0.1)" }}
              >
                <span className="font-mono text-muted-foreground w-12">{e.from}→{e.to}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted) / 0.2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: pct > 70 ? "hsl(var(--destructive))" : pct > 40 ? "hsl(45 100% 55%)" : "hsl(var(--neon))",
                    }}
                  />
                </div>
                <span className="font-mono text-muted-foreground w-6 text-right">{e.weight}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithm Steps */}
      {algorithmSteps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] font-medium flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" /> Dijkstra Steps
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1 font-mono text-[9px]">
            {algorithmSteps.map((step, i) => (
              <div
                key={i}
                className="px-2 py-1 rounded-lg flex items-start gap-2"
                style={{ background: "hsl(var(--muted) / 0.1)" }}
              >
                <span className="text-muted-foreground/40 shrink-0 w-4 text-right">{i + 1}</span>
                <span className="text-muted-foreground/80">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path dump */}
      {path.length > 0 && (
        <div className="p-2 rounded-lg font-mono text-[9px] text-neon/80" style={{ background: "hsl(var(--neon) / 0.05)", border: "1px solid hsl(var(--neon) / 0.15)" }}>
          Route: {path.join(" → ")} | Cost: {metrics.cost} | Hops: {metrics.hops}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
