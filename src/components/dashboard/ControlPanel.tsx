import { useState } from "react";
import { Plus, Minus, Zap, ZapOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Props {
  nodes: Node[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onAddNode: () => void;
  onRemoveNode: (id: string) => void;
  selectedSource: string;
  selectedDest: string;
}

const ControlPanel = ({
  nodes,
  isSimulating,
  onToggleSimulation,
  onAddNode,
  onRemoveNode,
  selectedSource,
  selectedDest,
}: Props) => {
  const [removeTarget, setRemoveTarget] = useState("");

  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{
            background: isSimulating
              ? "linear-gradient(135deg, hsl(var(--neon) / 0.25), hsl(var(--neon) / 0.1))"
              : "linear-gradient(135deg, hsl(var(--neon-blue) / 0.15), hsl(var(--neon-blue) / 0.05))",
            border: isSimulating
              ? "1px solid hsl(var(--neon) / 0.4)"
              : "1px solid hsl(var(--neon-blue) / 0.2)",
          }}
        >
          {isSimulating ? (
            <Zap className="w-3.5 h-3.5 text-neon animate-pulse-neon" />
          ) : (
            <ZapOff className="w-3.5 h-3.5 text-blue-400" />
          )}
        </div>
        <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">
          Simulation Control
        </h3>
      </div>

      {/* Simulate Traffic Toggle */}
      <div
        className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
        style={{
          background: "hsl(var(--muted) / 0.2)",
          border: isSimulating
            ? "1px solid hsl(var(--neon) / 0.3)"
            : "1px solid hsl(var(--border) / 0.2)",
        }}
      >
        <div>
          <p className="text-xs font-medium text-foreground">Simulate Traffic</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isSimulating ? "Live congestion active" : "Static mode"}
          </p>
        </div>
        <Switch checked={isSimulating} onCheckedChange={onToggleSimulation} />
      </div>

      {isSimulating && (
        <div className="flex items-center gap-2 text-[10px] text-neon font-medium animate-fade-in">
          <div
            className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse-neon"
            style={{ boxShadow: "0 0 6px hsl(var(--neon) / 0.5)" }}
          />
          Congestion simulation running...
        </div>
      )}

      {/* Selection info */}
      {(selectedSource || selectedDest) && (
        <div
          className="p-3 rounded-xl animate-fade-in"
          style={{
            background: "hsl(var(--neon) / 0.05)",
            border: "1px solid hsl(var(--neon) / 0.15)",
          }}
        >
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] mb-1.5 font-medium">
            Click Selection
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-neon">
              {selectedSource
                ? nodes.find((n) => n.id === selectedSource)?.label || "—"
                : "Click source"}
            </span>
            <span className="text-muted-foreground/40">→</span>
            <span className="font-mono text-neon">
              {selectedDest
                ? nodes.find((n) => n.id === selectedDest)?.label || "—"
                : "Click dest"}
            </span>
          </div>
        </div>
      )}

      {/* Add/Remove Nodes */}
      <div className="border-t border-border/20 pt-3 space-y-2">
        <p className="text-[10px] text-muted-foreground/70 uppercase tracking-[0.12em] font-medium">
          Node Management
        </p>
        <button
          onClick={onAddNode}
          className="btn-neon w-full flex items-center justify-center gap-2 py-2 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Node
        </button>
        <div className="flex gap-2">
          <select
            value={removeTarget}
            onChange={(e) => setRemoveTarget(e.target.value)}
            className="flex-1 select-premium focus-glow text-xs"
          >
            <option value="">Select node...</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.id})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (removeTarget) {
                onRemoveNode(removeTarget);
                setRemoveTarget("");
              }
            }}
            disabled={!removeTarget}
            className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{
              background: removeTarget
                ? "hsl(var(--destructive) / 0.15)"
                : "hsl(var(--muted) / 0.2)",
              border: removeTarget
                ? "1px solid hsl(var(--destructive) / 0.3)"
                : "1px solid hsl(var(--border) / 0.2)",
              color: removeTarget
                ? "hsl(var(--destructive))"
                : "hsl(var(--muted-foreground))",
            }}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
