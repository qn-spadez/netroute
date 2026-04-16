import { Keyboard, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: "F", desc: "Find route (focus)" },
  { key: "S", desc: "Toggle simulation" },
  { key: "N", desc: "Add node" },
  { key: "D", desc: "Toggle debug mode" },
  { key: "T", desc: "Toggle theme" },
  { key: "E", desc: "Export route history" },
  { key: "?", desc: "Show shortcuts" },
];

const KeyboardShortcutsHelp = ({ open, onClose }: Props) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative glass-card p-6 w-80 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-neon" />
            <h3 className="text-sm font-heading font-semibold text-foreground">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted/30 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.desc}</span>
              <kbd
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium"
                style={{
                  background: "hsl(var(--muted) / 0.3)",
                  border: "1px solid hsl(var(--border) / 0.4)",
                  color: "hsl(var(--foreground))",
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
