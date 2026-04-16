import { networkNodes, networkEdges } from "@/lib/graph-data";

interface Props {
  path: string[];
}

const NetworkMinimap = ({ path }: Props) => {
  const pathSet = new Set(path);
  const pathEdges = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    pathEdges.add(`${path[i]}-${path[i + 1]}`);
    pathEdges.add(`${path[i + 1]}-${path[i]}`);
  }

  return (
    <div className="absolute bottom-4 right-4 w-44 h-28 glass-card p-2.5 z-10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
      style={{
        boxShadow: "0 4px 24px hsl(var(--background) / 0.6)",
      }}
    >
      <p className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-1 font-medium">Overview</p>
      <svg viewBox="0 0 100 80" className="w-full h-full">
        {networkEdges.map((e, i) => {
          const from = networkNodes.find(n => n.id === e.from);
          const to = networkNodes.find(n => n.id === e.to);
          if (!from || !to) return null;
          const isPath = pathEdges.has(`${e.from}-${e.to}`);
          return (
            <line
              key={i}
              x1={from.x * 100} y1={from.y * 80}
              x2={to.x * 100} y2={to.y * 80}
              stroke={isPath ? "hsl(var(--neon))" : "rgba(100,160,255,0.12)"}
              strokeWidth={isPath ? 1.5 : 0.5}
            />
          );
        })}
        {networkNodes.map(n => (
          <circle
            key={n.id}
            cx={n.x * 100} cy={n.y * 80}
            r={pathSet.has(n.id) ? 3 : 1.5}
            fill={pathSet.has(n.id) ? "hsl(var(--neon))" : "rgba(100,160,255,0.25)"}
          />
        ))}
      </svg>
    </div>
  );
};

export default NetworkMinimap;
