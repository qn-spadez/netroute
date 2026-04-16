import { useEffect, useRef, useState, useCallback } from "react";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
}

interface Props {
  nodes: Node[];
  edges: Edge[];
  path: string[];
  isAnimating: boolean;
  isSimulating?: boolean;
  revealProgress?: number;
  onNodeClick?: (id: string) => void;
  onNodeDrag?: (id: string, x: number, y: number) => void;
  selectedSource?: string;
  selectedDest?: string;
  showEdgeWeights?: boolean;
}

const NetworkGraph = ({
  nodes,
  edges,
  path,
  isAnimating,
  isSimulating = false,
  revealProgress = 1,
  onNodeClick,
  onNodeDrag,
  selectedSource,
  selectedDest,
  showEdgeWeights = true,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const isDragging = useRef(false);

  const safeArc = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
    const radius = Math.max(0.5, Math.abs(r) || 0.5);
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  };

  const getNode = useCallback(
    (id: string) => nodes.find((n) => n.id === id),
    [nodes]
  );

  const findNodeAt = useCallback(
    (mx: number, my: number, w: number, h: number): Node | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const nx = n.x * w;
        const ny = n.y * h;
        if (Math.hypot(mx - nx, my - ny) < 20) return n;
      }
      return null;
    },
    [nodes]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      try {
        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        ctx.clearRect(0, 0, w, h);
        if (isSimulating || isAnimating) {
          timeRef.current += 0.016;
        }
        const t = timeRef.current;

        // ===== EDGES =====
        edges.forEach((edge) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          if (!from || !to) return;

          const fx = from.x * w;
          const fy = from.y * h;
          const tx = to.x * w;
          const ty = to.y * h;

          const fromIdx = path.indexOf(edge.from);
          const toIdx = path.indexOf(edge.to);
          const isPath =
            fromIdx >= 0 &&
            toIdx >= 0 &&
            Math.abs(fromIdx - toIdx) === 1;

          // Weight label for congested edges
          const isCongested = edge.weight > 14;

          // Base line
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.lineWidth = 1;
          ctx.strokeStyle = isCongested
            ? "rgba(255,100,100,0.3)"
            : "rgba(100,160,255,0.2)";
          ctx.stroke();

          // Weight label
          if (showEdgeWeights) {
            const midX = (fx + tx) / 2;
            const midY = (fy + ty) / 2;
            ctx.font = "9px Inter";
            ctx.fillStyle = isCongested
              ? "rgba(255,100,100,0.5)"
              : "rgba(100,160,255,0.3)";
            ctx.textAlign = "center";
            ctx.fillText(String(edge.weight), midX, midY - 4);
          }

          // Animated path
          if (isPath) {
            const segProgress = Math.min(
              1,
              revealProgress * path.length - Math.min(fromIdx, toIdx)
            );
            if (segProgress > 0) {
              const spx = fx + (tx - fx) * Math.min(1, segProgress);
              const spy = fy + (ty - fy) * Math.min(1, segProgress);
              ctx.beginPath();
              ctx.moveTo(fx, fy);
              ctx.lineTo(spx, spy);
              ctx.setLineDash([10, 6]);
              ctx.lineDashOffset = -t * 30;
              ctx.strokeStyle = "#00ff9c";
              ctx.lineWidth = 2.5;
              ctx.shadowColor = "rgba(0,255,156,0.4)";
              ctx.shadowBlur = 8;
              ctx.stroke();
              ctx.shadowBlur = 0;
              ctx.setLineDash([]);
            }
          }

          // Packets (only when simulating or animating route reveal)
          if ((isAnimating && isSimulating) && isPath) {
            const dx = tx - fx;
            const dy = ty - fy;
            for (let p = 0; p < 4; p++) {
              const progress = (t * 0.4 + p * 0.2) % 1;
              const px = fx + dx * progress;
              const py = fy + dy * progress;
              const pr = 2.5 + Math.sin(t * 5 + p) * 0.8;
              ctx.beginPath();
              safeArc(ctx, px, py, pr);
              ctx.fillStyle = "rgba(0,255,156,0.9)";
              ctx.shadowColor = "rgba(0,255,156,0.6)";
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        });

        // ===== NODES =====
        nodes.forEach((node) => {
          const nx = node.x * w;
          const ny = node.y * h;
          const isActive = path.includes(node.id);
          const isHovered = hoveredNode === node.id;
          const isSrc = selectedSource === node.id;
          const isDst = selectedDest === node.id;
          const baseRadius = isActive ? 18 : 12;
          const radius = isHovered ? baseRadius + 4 : baseRadius;

          // Outer glow for selected
          if (isSrc || isDst) {
            const glowR = radius + 8 + Math.sin(t * 4) * 3;
            ctx.beginPath();
            safeArc(ctx, nx, ny, glowR);
            ctx.fillStyle = isSrc
              ? "rgba(0,255,156,0.08)"
              : "rgba(100,160,255,0.08)";
            ctx.fill();

            ctx.beginPath();
            safeArc(ctx, nx, ny, glowR);
            ctx.strokeStyle = isSrc
              ? "rgba(0,255,156,0.3)"
              : "rgba(100,160,255,0.3)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Active glow
          if (isActive) {
            const glow = radius + Math.sin(t * 3) * 4;
            ctx.beginPath();
            safeArc(ctx, nx, ny, glow);
            ctx.fillStyle = "rgba(0,255,156,0.1)";
            ctx.fill();
          }

          // Node circle
          ctx.beginPath();
          safeArc(ctx, nx, ny, radius);
          ctx.fillStyle = isSrc
            ? "rgba(0,255,156,0.25)"
            : isDst
              ? "rgba(100,160,255,0.25)"
              : isActive
                ? "rgba(0,255,156,0.2)"
                : isHovered
                  ? "rgba(100,160,255,0.3)"
                  : "rgba(100,160,255,0.15)";
          ctx.fill();
          ctx.strokeStyle = isSrc
            ? "#00ff9c"
            : isDst
              ? "#649cff"
              : isActive
                ? "#00ff9c"
                : isHovered
                  ? "#8bb4ff"
                  : "#649cff";
          ctx.lineWidth = isSrc || isDst ? 2.5 : 2;
          ctx.stroke();

          // Label
          ctx.fillStyle = isHovered || isSrc || isDst ? "#fff" : "rgba(255,255,255,0.85)";
          ctx.font = isHovered ? "bold 13px Inter" : "12px Inter";
          ctx.textAlign = "center";
          ctx.fillText(node.label, nx, ny + 4);

          // Source/Dest indicator
          if (isSrc) {
            ctx.fillStyle = "rgba(0,255,156,0.7)";
            ctx.font = "bold 9px Inter";
            ctx.fillText("SRC", nx, ny - radius - 6);
          }
          if (isDst) {
            ctx.fillStyle = "rgba(100,160,255,0.7)";
            ctx.font = "bold 9px Inter";
            ctx.fillText("DST", nx, ny - radius - 6);
          }
        });
      } catch (err) {
        console.error("DRAW ERROR:", err);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [nodes, edges, path, isAnimating, isSimulating, revealProgress, hoveredNode, getNode, selectedSource, selectedDest, showEdgeWeights]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      if (dragRef.current && onNodeDrag) {
        isDragging.current = true;
        const newX = Math.max(0.02, Math.min(0.98, mx / w));
        const newY = Math.max(0.02, Math.min(0.98, my / h));
        onNodeDrag(dragRef.current.id, newX, newY);
        return;
      }

      const node = findNodeAt(mx, my, w, h);
      setHoveredNode(node?.id || null);
      canvas.style.cursor = node ? "pointer" : "default";
    },
    [findNodeAt, onNodeDrag]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      const node = findNodeAt(mx, my, w, h);
      if (node) {
        dragRef.current = { id: node.id, offsetX: 0, offsetY: 0 };
        isDragging.current = false;
      }
    },
    [findNodeAt]
  );

  const handleMouseUp = useCallback(() => {
    if (dragRef.current && !isDragging.current && onNodeClick) {
      onNodeClick(dragRef.current.id);
    }
    dragRef.current = null;
    isDragging.current = false;
  }, [onNodeClick]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      {/* Interaction hint */}
      {!path.length && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 pointer-events-none animate-fade-in">
          Click nodes to select source → destination · Drag to reposition
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
