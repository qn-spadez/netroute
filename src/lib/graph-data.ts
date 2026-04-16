export const networkNodes = [
  { id: "A", label: "NYC", x: 0.15, y: 0.25 },
  { id: "B", label: "LON", x: 0.35, y: 0.15 },
  { id: "C", label: "TKY", x: 0.75, y: 0.2 },
  { id: "D", label: "SFO", x: 0.1, y: 0.55 },
  { id: "E", label: "FRA", x: 0.45, y: 0.45 },
  { id: "F", label: "SIN", x: 0.7, y: 0.55 },
  { id: "G", label: "SYD", x: 0.85, y: 0.75 },
  { id: "H", label: "DXB", x: 0.55, y: 0.35 },
  { id: "I", label: "SAO", x: 0.25, y: 0.75 },
  { id: "J", label: "MUM", x: 0.6, y: 0.65 },
  { id: "K", label: "SEA", x: 0.08, y: 0.38 },
  { id: "L", label: "HKG", x: 0.78, y: 0.42 },
];

export const networkEdges = [
  { from: "A", to: "B", weight: 12 },
  { from: "A", to: "D", weight: 8 },
  { from: "A", to: "K", weight: 6 },
  { from: "B", to: "E", weight: 5 },
  { from: "B", to: "H", weight: 14 },
  { from: "C", to: "L", weight: 4 },
  { from: "C", to: "F", weight: 10 },
  { from: "D", to: "K", weight: 3 },
  { from: "D", to: "I", weight: 15 },
  { from: "E", to: "H", weight: 7 },
  { from: "E", to: "F", weight: 11 },
  { from: "F", to: "J", weight: 6 },
  { from: "F", to: "L", weight: 5 },
  { from: "F", to: "G", weight: 9 },
  { from: "G", to: "J", weight: 13 },
  { from: "H", to: "J", weight: 8 },
  { from: "H", to: "L", weight: 9 },
  { from: "I", to: "J", weight: 18 },
  { from: "K", to: "E", weight: 16 },
  { from: "A", to: "E", weight: 10 },
];

// Dijkstra's algorithm
export function findShortestPath(source: string, dest: string) {
  const adj: Record<string, { to: string; w: number }[]> = {};
  networkNodes.forEach((n) => (adj[n.id] = []));
  networkEdges.forEach((e) => {
    adj[e.from].push({ to: e.to, w: e.weight });
    adj[e.to].push({ to: e.from, w: e.weight });
  });

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  networkNodes.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[source] = 0;

  for (let i = 0; i < networkNodes.length; i++) {
    let u = "";
    let minD = Infinity;
    for (const n of networkNodes) {
      if (!visited.has(n.id) && dist[n.id] < minD) { u = n.id; minD = dist[n.id]; }
    }
    if (!u) break;
    visited.add(u);
    for (const { to, w } of adj[u]) {
      const alt = dist[u] + w;
      if (alt < dist[to]) { dist[to] = alt; prev[to] = u; }
    }
  }

  const path: string[] = [];
  let cur: string | null = dest;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  if (path[0] !== source) return { path: [], cost: 0, hops: 0 };
  return { path, cost: dist[dest], hops: path.length - 1 };
}

export function generateChartData() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    latency: Math.round(20 + Math.random() * 40),
    traffic: Math.round(30 + Math.random() * 60),
  }));
}
