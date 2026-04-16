import { Clock, Download, Trash2, ChevronRight } from "lucide-react";
import { RouteRecord } from "@/hooks/useRouteHistory";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  history: RouteRecord[];
  onClear: () => void;
  onExport: () => void;
  onReplay?: (record: RouteRecord) => void;
  nodeLabel: (id: string) => string;
}

const RouteHistoryPanel = ({ history, onClear, onExport, onReplay, nodeLabel }: Props) => {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--neon-purple) / 0.2), hsl(var(--neon-purple) / 0.05))",
              border: "1px solid hsl(var(--neon-purple) / 0.3)",
            }}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <h3 className="text-sm font-heading font-semibold text-foreground tracking-tight">
            Route History
          </h3>
          <span className="text-[10px] text-muted-foreground/60 ml-1">({history.length})</span>
        </div>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onExport}
                disabled={!history.length}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-muted/40 disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Export as JSON (E)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClear}
                disabled={!history.length}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-destructive/20 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear history</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-[10px] text-muted-foreground/50 text-center py-4">No routes computed yet</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1.5">
          {history.map((r) => (
            <button
              key={r.id}
              onClick={() => onReplay?.(r)}
              className="traffic-row w-full group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[10px] text-neon shrink-0">
                  {nodeLabel(r.source)}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                <span className="font-mono text-[10px] text-neon-blue shrink-0">
                  {nodeLabel(r.dest)}
                </span>
                <span className="text-[9px] text-muted-foreground/40 ml-auto shrink-0">
                  {r.hops}h · {r.cost}w
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground/30 shrink-0 ml-2">
                {r.timestamp.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteHistoryPanel;
