import { useEffect } from "react";

interface Shortcuts {
  onFindRoute?: () => void;
  onToggleSimulation?: () => void;
  onAddNode?: () => void;
  onToggleDebug?: () => void;
  onToggleTheme?: () => void;
  onExport?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (key === "f" && !ctrl) { e.preventDefault(); shortcuts.onFindRoute?.(); }
      if (key === "s" && !ctrl) { e.preventDefault(); shortcuts.onToggleSimulation?.(); }
      if (key === "n" && !ctrl) { e.preventDefault(); shortcuts.onAddNode?.(); }
      if (key === "d" && !ctrl) { e.preventDefault(); shortcuts.onToggleDebug?.(); }
      if (key === "t" && !ctrl) { e.preventDefault(); shortcuts.onToggleTheme?.(); }
      if (key === "e" && !ctrl) { e.preventDefault(); shortcuts.onExport?.(); }
      if (key === "?" || (key === "/" && e.shiftKey)) { e.preventDefault(); /* handled by help dialog */ }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}
