import { useEffect, useState, useRef } from "react";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  status?: string;
  color?: "neon" | "blue" | "purple";
  threshold?: { good: number; moderate: number };
}

const MetricCard = ({ icon: Icon, label, value, suffix = "", status, color = "neon", threshold }: Props) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => {
    const diff = value - prevValue.current;
    if (diff > 1) setTrend("up");
    else if (diff < -1) setTrend("down");
    else setTrend("flat");
    prevValue.current = value;

    const duration = 800;
    const start = performance.now();
    const from = display;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  let severityClass = "";
  if (threshold) {
    if (value <= threshold.good) severityClass = "severity-good";
    else if (value <= threshold.moderate) severityClass = "severity-moderate";
    else severityClass = "severity-critical";
  }

  const colorStyles: Record<string, { text: string; bgStyle: React.CSSProperties; borderStyle: React.CSSProperties }> = {
    neon: {
      text: "text-neon",
      bgStyle: { background: "hsl(var(--neon) / 0.08)" },
      borderStyle: { border: "1px solid hsl(var(--neon) / 0.15)" },
    },
    blue: {
      text: "text-neon-blue",
      bgStyle: { background: "hsl(var(--neon-blue) / 0.08)" },
      borderStyle: { border: "1px solid hsl(var(--neon-blue) / 0.15)" },
    },
    purple: {
      text: "text-neon-purple",
      bgStyle: { background: "hsl(var(--neon-purple) / 0.08)" },
      borderStyle: { border: "1px solid hsl(var(--neon-purple) / 0.15)" },
    },
  };

  const severityMap: Record<string, typeof colorStyles["neon"]> = {
    "severity-good": colorStyles.neon,
    "severity-moderate": {
      text: "text-yellow-400",
      bgStyle: { background: "hsl(45 95% 60% / 0.08)" },
      borderStyle: { border: "1px solid hsl(45 95% 60% / 0.15)" },
    },
    "severity-critical": {
      text: "text-destructive",
      bgStyle: { background: "hsl(var(--destructive) / 0.08)" },
      borderStyle: { border: "1px solid hsl(var(--destructive) / 0.15)" },
    },
  };

  const c = severityClass ? severityMap[severityClass] : colorStyles[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="metric-card animate-fade-in group">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg transition-all duration-200 group-hover:scale-110"
          style={{ ...c.bgStyle, ...c.borderStyle }}
        >
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <div className="flex items-center gap-1.5">
          {trend !== "flat" && (
            <TrendIcon className={`w-3 h-3 ${trend === "up" ? "text-destructive" : "text-neon"}`} />
          )}
          {status && (
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${c.text} uppercase tracking-wider`}
              style={c.bgStyle}
            >
              {status}
            </span>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/60 mb-1 uppercase tracking-[0.1em] font-medium">{label}</p>
      <p className={`text-2xl font-heading font-bold ${c.text}`}>
        {display}{suffix}
      </p>
    </div>
  );
};

export default MetricCard;
