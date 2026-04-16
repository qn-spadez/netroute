import { useState, useCallback } from "react";

export interface RouteRecord {
  id: number;
  source: string;
  dest: string;
  path: string[];
  cost: number;
  latency: number;
  hops: number;
  status: string;
  timestamp: Date;
}

export function useRouteHistory() {
  const [history, setHistory] = useState<RouteRecord[]>([]);

  const addRecord = useCallback(
    (record: Omit<RouteRecord, "id" | "timestamp">) => {
      setHistory((prev) => [
        { ...record, id: Date.now(), timestamp: new Date() },
        ...prev.slice(0, 19),
      ]);
    },
    []
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  return { history, addRecord, clearHistory, exportJSON };
}
