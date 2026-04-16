import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import NetworkGraph from "@/components/dashboard/NetworkGraph";
import NetworkMinimap from "@/components/dashboard/NetworkMinimap";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import RoutePanel from "@/components/dashboard/RoutePanel";
import ControlPanel from "@/components/dashboard/ControlPanel";
import LiveTrafficPanel from "@/components/dashboard/LiveTrafficPanel";
import DecisionEngine from "@/components/dashboard/DecisionEngine";
import TrafficChart from "@/components/dashboard/TrafficChart";
import RouteHistoryPanel from "@/components/dashboard/RouteHistoryPanel";
import DebugPanel from "@/components/dashboard/DebugPanel";
import KeyboardShortcutsHelp from "@/components/dashboard/KeyboardShortcutsHelp";
import SecurityPanel from "@/components/dashboard/SecurityPanel";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { PanelSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRouteHistory } from "@/hooks/useRouteHistory";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sun, Moon, Bug, Keyboard } from "lucide-react";
import {
  networkNodes as defaultNodes,
  networkEdges as defaultEdges,
  generateChartData,
} from "@/lib/graph-data";

type View = "dashboard" | "live-traffic" | "analytics" | "security" | "alerts" | "settings";

const cityNames = ["BER", "OSL", "MAD", "ROM", "AMS", "CPH", "IST", "LIS", "WAR", "PRG", "BKK", "MEX", "LIM", "BOG", "SCL"];

const Index = () => {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [nodes, setNodes] = useState([...defaultNodes]);
  const [edges, setEdges] = useState([...defaultEdges]);
  const [path, setPath] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealProgress, setRevealProgress] = useState(1);
  const [metrics, setMetrics] = useState({ cost: 0, latency: 0, hops: 0, status: "Idle" });
  const [chartData, setChartData] = useState(generateChartData());
  const [rippleKey, setRippleKey] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedDest, setSelectedDest] = useState("");
  const [debugMode, setDebugMode] = useState(false);
  const [algorithmSteps, setAlgorithmSteps] = useState<string[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [showEdgeWeights, setShowEdgeWeights] = useState(true);
  const revealAnimRef = useRef<number>(0);
  const simRef = useRef<number>(0);

  const { theme, toggle: toggleTheme } = useTheme();
  const { history, addRecord, clearHistory, exportJSON } = useRouteHistory();

  const nodeLabel = useCallback((id: string) => nodes.find((n) => n.id === id)?.label || id, [nodes]);

  // Simulate initial load
  useEffect(() => {
    const t = setTimeout(() => setInitialLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setChartData(generateChartData()), 5000);
    return () => clearInterval(interval);
  }, []);

  const computeRoute = useCallback(
    (source: string, dest: string, currentNodes: typeof nodes, currentEdges: typeof edges) => {
      const adj: Record<string, { to: string; w: number }[]> = {};
      currentNodes.forEach((n) => (adj[n.id] = []));
      currentEdges.forEach((e) => {
        if (adj[e.from] && adj[e.to]) {
          adj[e.from].push({ to: e.to, w: e.weight });
          adj[e.to].push({ to: e.from, w: e.weight });
        }
      });

      const steps: string[] = [];
      const dist: Record<string, number> = {};
      const prev: Record<string, string | null> = {};
      const visited = new Set<string>();
      currentNodes.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null; });
      dist[source] = 0;
      steps.push(`Init: dist[${source}] = 0`);

      for (let i = 0; i < currentNodes.length; i++) {
        let u = "";
        let minD = Infinity;
        for (const n of currentNodes) {
          if (!visited.has(n.id) && dist[n.id] < minD) { u = n.id; minD = dist[n.id]; }
        }
        if (!u) break;
        visited.add(u);
        steps.push(`Visit ${u} (dist=${minD})`);
        for (const { to, w } of adj[u] || []) {
          const alt = dist[u] + w;
          if (alt < dist[to]) {
            dist[to] = alt;
            prev[to] = u;
            steps.push(`  Relax ${u}→${to}: ${dist[to]} → ${alt}`);
          }
        }
      }

      const p: string[] = [];
      let cur: string | null = dest;
      while (cur) { p.unshift(cur); cur = prev[cur]; }
      if (p[0] !== source) {
        setAlgorithmSteps(steps);
        return { path: [], cost: 0, hops: 0 };
      }
      steps.push(`Path: ${p.join("→")} (cost=${dist[dest]})`);
      setAlgorithmSteps(steps);
      return { path: p, cost: dist[dest], hops: p.length - 1 };
    },
    []
  );

  const handleFindRoute = useCallback(
    (source: string, dest: string) => {
      setIsLoading(true);
      setPath([]);
      setIsAnimating(false);
      setRevealProgress(0);
      setRippleKey((k) => k + 1);
      setSelectedSource(source);
      setSelectedDest(dest);

      setTimeout(() => {
        const result = computeRoute(source, dest, nodes, edges);
        setPath(result.path);
        const m = {
          cost: result.cost,
          latency: Math.round(result.cost * 2.3 + Math.random() * 10),
          hops: result.hops,
          status: result.cost < 20 ? "Optimal" : result.cost < 35 ? "Normal" : "Congested",
        };
        setMetrics(m);
        setIsLoading(false);

        if (result.path.length > 0) {
          addRecord({ source, dest, path: result.path, cost: result.cost, latency: m.latency, hops: result.hops, status: m.status });
        }

        let start: number | null = null;
        const duration = Math.max(800, result.hops * 400);
        const animate = (timestamp: number) => {
          if (!start) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(1, elapsed / duration);
          setRevealProgress(1 - Math.pow(1 - progress, 3));
          if (progress < 1) revealAnimRef.current = requestAnimationFrame(animate);
          else setIsAnimating(true);
        };
        revealAnimRef.current = requestAnimationFrame(animate);
      }, 1200);
    },
    [nodes, edges, computeRoute, addRecord]
  );

  const handleNodeClick = useCallback(
    (id: string) => {
      if (!selectedSource || (selectedSource && selectedDest)) {
        setSelectedSource(id);
        setSelectedDest("");
        setPath([]);
        setIsAnimating(false);
      } else {
        setSelectedDest(id);
        handleFindRoute(selectedSource, id);
      }
    },
    [selectedSource, selectedDest, handleFindRoute]
  );

  const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }, []);

  const handleAddNode = useCallback(() => {
    const usedIds = new Set(nodes.map((n) => n.id));
    let newId = "";
    for (let c = 65; c < 91; c++) {
      if (!usedIds.has(String.fromCharCode(c))) { newId = String.fromCharCode(c); break; }
    }
    if (!newId) return;
    const usedLabels = new Set(nodes.map((n) => n.label));
    const label = cityNames.find((c) => !usedLabels.has(c)) || `N${nodes.length + 1}`;
    const newNode = { id: newId, label, x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4 };
    const shuffled = [...nodes].sort(() => Math.random() - 0.5);
    const newEdges = shuffled.slice(0, Math.min(2, shuffled.length)).map((n) => ({
      from: newId, to: n.id, weight: Math.round(5 + Math.random() * 15),
    }));
    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, ...newEdges]);
  }, [nodes]);

  const handleRemoveNode = useCallback(
    (id: string) => {
      if (nodes.length <= 3) return;
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
      if (selectedSource === id) setSelectedSource("");
      if (selectedDest === id) setSelectedDest("");
      setPath((prev) => (prev.includes(id) ? [] : prev));
    },
    [nodes.length, selectedSource, selectedDest]
  );

  // Traffic simulation
  useEffect(() => {
    if (!isSimulating) { clearInterval(simRef.current); return; }
    simRef.current = window.setInterval(() => {
      setEdges((prev) => prev.map((e) => ({ ...e, weight: Math.max(1, e.weight + Math.round((Math.random() - 0.45) * 6)) })));
    }, Math.round(1500 / simulationSpeed));
    return () => clearInterval(simRef.current);
  }, [isSimulating, simulationSpeed]);

  useEffect(() => {
    if (!isSimulating || !selectedSource || !selectedDest || path.length === 0) return;
    const result = computeRoute(selectedSource, selectedDest, nodes, edges);
    if (result.path.join(",") !== path.join(",")) {
      setPath(result.path);
      setMetrics({ cost: result.cost, latency: Math.round(result.cost * 2.3 + Math.random() * 10), hops: result.hops, status: result.cost < 20 ? "Optimal" : result.cost < 35 ? "Normal" : "Congested" });
      setIsAnimating(true);
      setRevealProgress(1);
    }
  }, [edges, isSimulating, selectedSource, selectedDest, path, nodes, computeRoute]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSimulation: () => setIsSimulating((p) => !p),
    onAddNode: handleAddNode,
    onToggleDebug: () => setDebugMode((p) => !p),
    onToggleTheme: toggleTheme,
    onExport: exportJSON,
  });

  // ? key for help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) { e.preventDefault(); setShowShortcuts((p) => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleReplayRoute = useCallback((record: { source: string; dest: string }) => {
    handleFindRoute(record.source, record.dest);
  }, [handleFindRoute]);

  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar metrics={metrics}>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setDebugMode((p) => !p)}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${debugMode ? "bg-destructive/20 text-destructive" : "hover:bg-muted/30 text-muted-foreground"}`}
                >
                  <Bug className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Debug Mode (D)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:bg-muted/30 text-muted-foreground"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Shortcuts (?)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg transition-all duration-200 hover:bg-muted/30 text-muted-foreground"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>Toggle Theme (T)</TooltipContent>
            </Tooltip>
          </div>
        </TopNavbar>

        <div className="flex-1 min-h-0 p-3 flex gap-3 cyber-grid">
          {activeView === "dashboard" && (
            <>
              <div className="w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-0.5">
                {initialLoading ? (
                  <>
                    <PanelSkeleton />
                    <PanelSkeleton />
                  </>
                ) : (
                  <>
                    <RoutePanel nodes={nodes} onFindRoute={handleFindRoute} isLoading={isLoading} path={path} metrics={metrics} />
                    <ControlPanel
                      nodes={nodes} isSimulating={isSimulating}
                      onToggleSimulation={() => setIsSimulating((p) => !p)}
                      onAddNode={handleAddNode} onRemoveNode={handleRemoveNode}
                      selectedSource={selectedSource} selectedDest={selectedDest}
                    />
                    <DecisionEngine isLoading={isLoading} path={path} metrics={metrics} />
                    <RouteHistoryPanel
                      history={history} onClear={clearHistory} onExport={exportJSON}
                      onReplay={handleReplayRoute} nodeLabel={nodeLabel}
                    />
                  </>
                )}
              </div>

              <div
                className="flex-1 relative min-w-0 rounded-xl overflow-hidden"
                style={{
                  border: "1px solid hsl(var(--border) / 0.2)",
                  boxShadow: "0 0 40px hsl(var(--neon) / 0.03), inset 0 0 60px hsl(var(--background) / 0.3)",
                }}
              >
                <NetworkGraph
                  key={rippleKey} nodes={nodes} edges={edges} path={path}
                  isAnimating={isAnimating} isSimulating={isSimulating}
                  revealProgress={revealProgress}
                  onNodeClick={handleNodeClick} onNodeDrag={handleNodeDrag}
                  selectedSource={selectedSource} selectedDest={selectedDest}
                  showEdgeWeights={showEdgeWeights}
                />
                <NetworkMinimap path={path} />
              </div>

              <div className="w-72 flex-shrink-0 overflow-y-auto pl-0.5 flex flex-col gap-3">
                {initialLoading ? (
                  <>
                    <PanelSkeleton />
                    <PanelSkeleton />
                  </>
                ) : (
                  <>
                    <AnalyticsPanel metrics={metrics} chartData={chartData} />
                    {debugMode && (
                      <DebugPanel nodes={nodes} edges={edges} path={path} metrics={metrics} algorithmSteps={algorithmSteps} />
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeView === "live-traffic" && (
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative min-w-0 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.2)" }}>
                <NetworkGraph nodes={nodes} edges={edges} path={path} isAnimating={isAnimating} revealProgress={revealProgress} onNodeClick={handleNodeClick} onNodeDrag={handleNodeDrag} selectedSource={selectedSource} selectedDest={selectedDest} />
                <NetworkMinimap path={path} />
              </div>
              <div className="w-80 flex-shrink-0 flex flex-col gap-3">
                <ControlPanel nodes={nodes} isSimulating={isSimulating} onToggleSimulation={() => setIsSimulating((p) => !p)} onAddNode={handleAddNode} onRemoveNode={handleRemoveNode} selectedSource={selectedSource} selectedDest={selectedDest} />
                <LiveTrafficPanel />
              </div>
            </div>
          )}

          {activeView === "analytics" && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
              <AnalyticsPanel metrics={metrics} chartData={chartData} />
              <TrafficChart data={chartData} />
            </div>
          )}

          {activeView === "security" && (
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative min-w-0 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.2)" }}>
                <NetworkGraph nodes={nodes} edges={edges} path={path} isAnimating={isAnimating && animationsEnabled} revealProgress={revealProgress} onNodeClick={handleNodeClick} onNodeDrag={handleNodeDrag} selectedSource={selectedSource} selectedDest={selectedDest} showEdgeWeights={showEdgeWeights} />
              </div>
              <div className="w-80 flex-shrink-0 overflow-y-auto flex flex-col gap-3">
                <SecurityPanel edges={edges} metrics={metrics} isSimulating={isSimulating} />
                <AlertsPanel edges={edges} metrics={metrics} isSimulating={isSimulating} nodes={nodes} />
              </div>
            </div>
          )}

          {activeView === "alerts" && (
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative min-w-0 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.2)" }}>
                <NetworkGraph nodes={nodes} edges={edges} path={path} isAnimating={isAnimating && animationsEnabled} revealProgress={revealProgress} onNodeClick={handleNodeClick} onNodeDrag={handleNodeDrag} selectedSource={selectedSource} selectedDest={selectedDest} showEdgeWeights={showEdgeWeights} />
              </div>
              <div className="w-80 flex-shrink-0 overflow-y-auto flex flex-col gap-3">
                <AlertsPanel edges={edges} metrics={metrics} isSimulating={isSimulating} nodes={nodes} />
                <ControlPanel nodes={nodes} isSimulating={isSimulating} onToggleSimulation={() => setIsSimulating((p) => !p)} onAddNode={handleAddNode} onRemoveNode={handleRemoveNode} selectedSource={selectedSource} selectedDest={selectedDest} />
              </div>
            </div>
          )}

          {activeView === "settings" && (
            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative min-w-0 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border) / 0.2)" }}>
                <NetworkGraph nodes={nodes} edges={edges} path={path} isAnimating={isAnimating && animationsEnabled} revealProgress={revealProgress} onNodeClick={handleNodeClick} onNodeDrag={handleNodeDrag} selectedSource={selectedSource} selectedDest={selectedDest} showEdgeWeights={showEdgeWeights} />
              </div>
              <div className="w-80 flex-shrink-0 overflow-y-auto flex flex-col gap-3">
                <SettingsPanel animationsEnabled={animationsEnabled} onToggleAnimations={setAnimationsEnabled} simulationSpeed={simulationSpeed} onSpeedChange={setSimulationSpeed} theme={theme} onToggleTheme={toggleTheme} showEdgeWeights={showEdgeWeights} onToggleEdgeWeights={setShowEdgeWeights} />
              </div>
            </div>
          )}
        </div>
      </div>

      <KeyboardShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
};

export default Index;
