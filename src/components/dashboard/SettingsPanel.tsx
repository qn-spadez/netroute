import { Settings, Sparkles, Gauge, Moon, Sun, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  animationsEnabled: boolean;
  onToggleAnimations: (v: boolean) => void;
  simulationSpeed: number;
  onSpeedChange: (v: number) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  showEdgeWeights: boolean;
  onToggleEdgeWeights: (v: boolean) => void;
}

const SettingsPanel = ({
  animationsEnabled, onToggleAnimations,
  simulationSpeed, onSpeedChange,
  theme, onToggleTheme,
  showEdgeWeights, onToggleEdgeWeights,
}: Props) => {
  const speedLabel = simulationSpeed < 0.7 ? "Slow" : simulationSpeed < 1.3 ? "Normal" : "Fast";

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-neon" />
        <h3 className="text-sm font-heading font-semibold text-foreground">Settings</h3>
      </div>

      {/* Animations Toggle */}
      <div className="rounded-lg p-3 space-y-2" style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className={cn("w-3.5 h-3.5", animationsEnabled ? "text-neon" : "text-muted-foreground")} />
            <span className="text-xs font-medium text-foreground">Animations</span>
          </div>
          <Switch checked={animationsEnabled} onCheckedChange={onToggleAnimations} />
        </div>
        <p className="text-[10px] text-muted-foreground">Enable particle effects and path animations</p>
      </div>

      {/* Simulation Speed */}
      <div className="rounded-lg p-3 space-y-3" style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className={cn("w-3.5 h-3.5 text-neon")} />
            <span className="text-xs font-medium text-foreground">Simulation Speed</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: "hsl(var(--neon) / 0.1)", color: "hsl(var(--neon))" }}>
            {speedLabel}
          </span>
        </div>
        <Slider
          value={[simulationSpeed * 100]}
          onValueChange={([v]) => onSpeedChange(v / 100)}
          min={20}
          max={200}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>0.2×</span>
          <span>1.0×</span>
          <span>2.0×</span>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-neon-blue" /> : <Sun className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="text-xs font-medium text-foreground">{theme === "dark" ? "Dark" : "Light"} Mode</span>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={onToggleTheme} />
        </div>
      </div>

      {/* Edge Weights Toggle */}
      <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted) / 0.2)", border: "1px solid hsl(var(--border) / 0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className={cn("w-3.5 h-3.5", showEdgeWeights ? "text-neon" : "text-muted-foreground")} />
            <span className="text-xs font-medium text-foreground">Show Edge Weights</span>
          </div>
          <Switch checked={showEdgeWeights} onCheckedChange={onToggleEdgeWeights} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
