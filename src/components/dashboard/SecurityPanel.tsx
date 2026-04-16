import { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Activity, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface Metrics {
  cost: number;
  latency: number;
  hops: number;
  status: string;
}

interface Props {
  edges: Edge[];
  metrics: Metrics;
  isSimulating: boolean;
}

type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";

const SecurityPanel = ({ edges, metrics, isSimulating }: Props) => {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("LOW");
  const [suspiciousNodes, setSuspiciousNodes] = useState(0);
  const [blockedEdges, setBlockedEdges] = useState(0);
  const [analysisMsg, setAnalysisMsg] = useState("Network stable. No anomalies detected.");
  const [scanProgress, setScanProgress] = useState(100);

  useEffect(() => {
    const highCostEdges = edges.filter((e) => e.weight > 18).length;
    const avgWeight = edges.reduce((s, e) => s + e.weight, 0) / (edges.length || 1);
    const suspicious = edges.filter((e) => e.weight > 22).length;
    const blocked = edges.filter((e) => e.weight > 25).length;

    setSuspiciousNodes(suspicious);
    setBlockedEdges(blocked);

    if (avgWeight > 20 || metrics.latency > 60 || highCostEdges > 4) {
      setThreatLevel("HIGH");
      setAnalysisMsg("⚠ Potential congestion detected. Multiple high-cost routes active.");
    } else if (avgWeight > 14 || metrics.latency > 35 || highCostEdges > 2) {
      setThreatLevel("MEDIUM");
      setAnalysisMsg("Elevated traffic detected. Monitoring edge performance.");
    } else {
      setThreatLevel("LOW");
      setAnalysisMsg("Network stable. No anomalies detected.");
    }
  }, [edges, metrics]);

  // Scan animation when simulating
  useEffect(() => {
    if (!isSimulating) { setScanProgress(100); return; }
    const interval = setInterval(() => {
      setScanProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 80);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const threatConfig = {
    LOW: { color: "text-emerald-400", bg: "hsl(157 100% 50% / 0.1)", border: "hsl(157 100% 50% / 0.25)", glow: "0 0 20px hsl(157 100% 50% / 0.15)", Icon: ShieldCheck, label: "LOW" },
    MEDIUM: { color: "text-yellow-400", bg: "hsl(45 100% 50% / 0.1)", border: "hsl(45 100% 50% / 0.25)", glow: "0 0 20px hsl(45 100% 50% / 0.15)", Icon: Shield, label: "MEDIUM" },
    HIGH: { color: "text-red-400", bg: "hsl(0 84% 60% / 0.1)", border: "hsl(0 84% 60% / 0.25)", glow: "0 0 20px hsl(0 84% 60% / 0.15)", Icon: ShieldAlert, label: "HIGH" },
  };

  const t = threatConfig[threatLevel];

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon" />
          <h3 className="text-sm font-heading font-semibold text-foreground">Security Monitor</h3>
        </div>
        {isSimulating && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium animate-pulse"
            style={{ background: "hsl(var(--neon) / 0.1)", color: "hsl(var(--neon))", border: "1px solid hsl(var(--neon) / 0.2)" }}>
            SCANNING
          </span>
        )}
      </div>

      {/* Threat Level */}
      <div className="rounded-xl p-3 text-center space-y-2 transition-all duration-500"
        style={{ background: t.bg, border: `1px solid ${t.border}`, boxShadow: t.glow }}>
        <t.Icon className={cn("w-8 h-8 mx-auto transition-all duration-500", t.color)} />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Threat Level</p>
        <p className={cn("text-xl font-heading font-bold tracking-wider", t.color)}>{t.label}</p>
      </div>

      {/* Scan Progress */}
      {isSimulating && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Network Scan</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted) / 0.5)" }}>
            <div className="h-full rounded-full transition-all duration-100"
              style={{ width: `${scanProgress}%`, background: `linear-gradient(90deg, hsl(var(--neon)), hsl(var(--neon-blue)))` }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5 text-center" style={{ background: "hsl(var(--muted) / 0.3)", border: "1px solid hsl(var(--border) / 0.2)" }}>
          <AlertTriangle className="w-3.5 h-3.5 mx-auto mb-1 text-yellow-400" />
          <p className="text-lg font-heading font-bold text-foreground">{suspiciousNodes}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Suspicious</p>
        </div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: "hsl(var(--muted) / 0.3)", border: "1px solid hsl(var(--border) / 0.2)" }}>
          <Wifi className="w-3.5 h-3.5 mx-auto mb-1 text-red-400" />
          <p className="text-lg font-heading font-bold text-foreground">{blockedEdges}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Blocked</p>
        </div>
      </div>

      {/* Live Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Avg Edge Weight</span>
          <span className="font-mono text-foreground">{(edges.reduce((s, e) => s + e.weight, 0) / (edges.length || 1)).toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">High-cost Edges</span>
          <span className="font-mono text-foreground">{edges.filter((e) => e.weight > 18).length} / {edges.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Current Latency</span>
          <span className={cn("font-mono", metrics.latency > 50 ? "text-red-400" : metrics.latency > 30 ? "text-yellow-400" : "text-emerald-400")}>
            {metrics.latency}ms
          </span>
        </div>
      </div>

      {/* Analysis Message */}
      <div className="rounded-lg p-2.5 text-xs text-muted-foreground leading-relaxed flex items-start gap-2"
        style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.15)" }}>
        <Activity className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neon" />
        <span>{analysisMsg}</span>
      </div>
    </div>
  );
};

export default SecurityPanel;
