import { useEffect, useState, useRef } from "react";
import { Bell, AlertTriangle, XCircle, Clock } from "lucide-react";
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

interface Alert {
  id: number;
  type: "warning" | "critical";
  message: string;
  timestamp: string;
  isNew: boolean;
}

interface Props {
  edges: Edge[];
  metrics: Metrics;
  isSimulating: boolean;
  nodes: { id: string; label: string; x: number; y: number }[];
}

let alertCounter = 0;

const AlertsPanel = ({ edges, metrics, isSimulating, nodes }: Props) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const prevMetrics = useRef(metrics);
  const prevEdges = useRef(edges);

  const nodeLabel = (id: string) => nodes.find((n) => n.id === id)?.label || id;

  const addAlert = (type: Alert["type"], message: string) => {
    const now = new Date();
    const ts = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setAlerts((prev) => {
      const next = [{ id: ++alertCounter, type, message, timestamp: ts, isNew: true }, ...prev].slice(0, 5);
      return next;
    });
    // Remove "new" flag after animation
    setTimeout(() => {
      setAlerts((prev) => prev.map((a) => a.id === alertCounter ? { ...a, isNew: false } : a));
    }, 600);
  };

  // React to metric changes
  useEffect(() => {
    const prev = prevMetrics.current;
    if (metrics.latency > 50 && prev.latency <= 50) {
      addAlert("critical", `High latency spike detected: ${metrics.latency}ms`);
    } else if (metrics.latency > 30 && prev.latency <= 30) {
      addAlert("warning", `Latency elevated to ${metrics.latency}ms`);
    }
    if (metrics.status === "Congested" && prev.status !== "Congested") {
      addAlert("critical", "Network congestion detected — rerouting recommended");
    }
    prevMetrics.current = metrics;
  }, [metrics]);

  // React to edge weight changes
  useEffect(() => {
    if (!isSimulating) return;
    const highEdges = edges.filter((e) => e.weight > 22);
    const prevHigh = prevEdges.current.filter((e) => e.weight > 22);
    if (highEdges.length > prevHigh.length) {
      const newHigh = highEdges.find((e) => !prevHigh.some((p) => p.from === e.from && p.to === e.to));
      if (newHigh) {
        addAlert("warning", `Traffic spike on ${nodeLabel(newHigh.from)}→${nodeLabel(newHigh.to)} (weight: ${newHigh.weight})`);
      }
    }
    const blocked = edges.filter((e) => e.weight > 25);
    const prevBlocked = prevEdges.current.filter((e) => e.weight > 25);
    if (blocked.length > prevBlocked.length) {
      addAlert("critical", `Edge blocked due to excessive load`);
    }
    prevEdges.current = edges;
  }, [edges, isSimulating]);

  // Periodic system alerts during simulation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      const msgs = [
        "Routine scan complete — no intrusions",
        "Packet inspection passed",
        "Firewall rules updated",
        "DDoS protection active",
      ];
      addAlert("warning", msgs[Math.floor(Math.random() * msgs.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const alertStyles = {
    warning: {
      bg: "hsl(45 100% 50% / 0.06)",
      border: "hsl(45 100% 50% / 0.2)",
      iconColor: "text-yellow-400",
      Icon: AlertTriangle,
    },
    critical: {
      bg: "hsl(0 84% 60% / 0.06)",
      border: "hsl(0 84% 60% / 0.2)",
      iconColor: "text-red-400",
      Icon: XCircle,
    },
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-neon" />
          <h3 className="text-sm font-heading font-semibold text-foreground">Live Alerts</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
          style={{ background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border) / 0.2)" }}>
          {alerts.length} active
        </span>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-0.5">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No alerts yet. Start simulation to generate events.
          </div>
        ) : (
          alerts.map((alert) => {
            const s = alertStyles[alert.type];
            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-lg p-2.5 flex items-start gap-2.5 transition-all duration-500",
                  alert.isNew && "animate-fade-in"
                )}
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <s.Icon className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", s.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isSimulating && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1" style={{ borderTop: "1px solid hsl(var(--border) / 0.15)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Monitoring active — alerts generated in real-time</span>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
