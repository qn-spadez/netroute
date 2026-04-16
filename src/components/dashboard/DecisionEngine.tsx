import { useState, useEffect, useRef } from "react";
import { Brain, CheckCircle2, Loader2, Zap, Activity, Route } from "lucide-react";

interface Props {
  isLoading: boolean;
  path: string[];
  metrics: { cost: number; latency: number; hops: number; status: string };
}

const STEPS = [
  { text: "Analyzing traffic patterns...", icon: Activity, duration: 400 },
  { text: "Evaluating latency metrics...", icon: Zap, duration: 400 },
  { text: "Computing shortest path (Dijkstra)...", icon: Route, duration: 300 },
  { text: "Selecting optimal path...", icon: Brain, duration: 200 },
];

const DecisionEngine = ({ isLoading, path, metrics }: Props) => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [typedChars, setTypedChars] = useState<number[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [phase, setPhase] = useState<"idle" | "thinking" | "done">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isLoading) {
      setPhase("thinking");
      setVisibleSteps(0);
      setTypedChars([]);
      setConfidence(0);

      let step = 0;
      const revealNext = () => {
        if (step >= STEPS.length) {
          clearInterval(intervalRef.current);
          return;
        }
        const currentStep = step;
        setVisibleSteps(currentStep + 1);
        let charIdx = 0;
        const text = STEPS[currentStep].text;
        const typeInterval = setInterval(() => {
          charIdx++;
          setTypedChars((prev) => {
            const next = [...prev];
            next[currentStep] = charIdx;
            return next;
          });
          if (charIdx >= text.length) clearInterval(typeInterval);
        }, 18);
        step++;
      };

      revealNext();
      intervalRef.current = setInterval(revealNext, 500);
      return () => clearInterval(intervalRef.current);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && path.length > 0 && phase === "thinking") {
      setPhase("done");
      setVisibleSteps(STEPS.length);
      setTypedChars(STEPS.map((s) => s.text.length));
      const target = metrics.cost < 20 ? 97 : metrics.cost < 35 ? 88 : 72;
      let current = 0;
      const step = () => {
        current += 2;
        if (current >= target) { setConfidence(target); return; }
        setConfidence(current);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    if (path.length === 0 && !isLoading) {
      setPhase("idle");
      setVisibleSteps(0);
      setTypedChars([]);
      setConfidence(0);
    }
  }, [isLoading, path, metrics, phase]);

  const badges = phase === "done" ? [
    { label: metrics.latency < 50 ? "LOW LATENCY" : "HIGH LATENCY", color: metrics.latency < 50 ? "neon" : "warn" },
    { label: metrics.status === "Congested" ? "HIGH TRAFFIC" : "NORMAL TRAFFIC", color: metrics.status === "Congested" ? "warn" : "neon" },
    { label: "OPTIMAL ROUTE", color: "neon" as const },
  ] : [];

  const badgeStyles: Record<string, React.CSSProperties> = {
    neon: {
      background: "hsl(var(--neon) / 0.1)",
      color: "hsl(var(--neon))",
      border: "1px solid hsl(var(--neon) / 0.25)",
    },
    warn: {
      background: "hsl(var(--destructive) / 0.1)",
      color: "hsl(var(--destructive))",
      border: "1px solid hsl(var(--destructive) / 0.25)",
    },
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: phase === "thinking"
              ? "linear-gradient(135deg, hsl(var(--neon) / 0.2), hsl(var(--neon-blue) / 0.1))"
              : "linear-gradient(135deg, hsl(var(--neon-purple) / 0.15), hsl(var(--neon-purple) / 0.05))",
            border: "1px solid hsl(var(--neon-purple) / 0.2)",
          }}
        >
          <Brain className={`w-3.5 h-3.5 text-neon-purple ${phase === "thinking" ? "animate-pulse-neon" : ""}`} />
        </div>
        <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">Decision Engine</h3>
        {phase === "thinking" && (
          <span className="ml-auto text-[10px] text-neon uppercase tracking-[0.12em] animate-pulse-neon font-medium">Processing</span>
        )}
        {phase === "done" && (
          <span className="ml-auto text-[10px] text-neon uppercase tracking-[0.12em] font-medium">Complete</span>
        )}
      </div>

      {phase === "idle" && (
        <p className="text-xs text-muted-foreground/50 italic">Awaiting route request...</p>
      )}

      {(phase === "thinking" || phase === "done") && (
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => {
            if (i >= visibleSteps) return null;
            const chars = typedChars[i] ?? 0;
            const displayText = step.text.slice(0, chars);
            const isDone = phase === "done" || (i < visibleSteps - 1);

            return (
              <div
                key={i}
                className="flex items-center gap-2.5 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon flex-shrink-0 drop-shadow-[0_0_4px_hsl(var(--neon)/0.4)]" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-neon-blue animate-spin flex-shrink-0" />
                )}
                <span className={`text-xs font-mono ${isDone ? "text-foreground/80" : "text-muted-foreground"}`}>
                  {displayText}
                  {!isDone && <span className="inline-block w-[2px] h-3 bg-neon ml-0.5 animate-pulse-neon" />}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {phase === "done" && (
        <>
          <div className="border-t border-border/20 pt-3 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] font-medium">Optimal Path Confidence</span>
              <span className="text-sm font-heading font-bold text-neon">{confidence}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "hsl(var(--muted) / 0.3)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${confidence}%`,
                  background: `linear-gradient(90deg, hsl(var(--neon)), hsl(var(--neon-blue)))`,
                  boxShadow: `0 0 12px hsl(var(--neon) / 0.4)`,
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 animate-fade-in">
            {badges.map((b) => (
              <span
                key={b.label}
                className="text-[9px] font-semibold px-2.5 py-1 rounded-lg uppercase tracking-[0.1em] transition-all duration-200 hover:scale-105"
                style={badgeStyles[b.color]}
              >
                {b.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DecisionEngine;
