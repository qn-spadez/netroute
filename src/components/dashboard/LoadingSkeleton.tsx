const SkeletonPulse = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`rounded-lg animate-pulse ${className}`}
    style={{ background: "hsl(var(--muted) / 0.3)", ...style }}
  />
);

export const GraphSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="space-y-4 w-3/4">
        {/* Fake nodes */}
        <div className="flex justify-between">
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <SkeletonPulse className="w-10 h-10 rounded-full" />
        </div>
        <div className="flex justify-around">
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <SkeletonPulse className="w-10 h-10 rounded-full" />
        </div>
        {/* Fake lines */}
        <SkeletonPulse className="w-full h-0.5" />
        <SkeletonPulse className="w-3/4 h-0.5 mx-auto" />
        <SkeletonPulse className="w-1/2 h-0.5 mx-auto" />
      </div>
    </div>
    <p className="text-xs text-muted-foreground/40 animate-pulse-neon z-10">Initializing network...</p>
  </div>
);

export const PanelSkeleton = () => (
  <div className="glass-card p-5 space-y-3">
    <div className="flex items-center gap-2">
      <SkeletonPulse className="w-7 h-7 rounded-lg" />
      <SkeletonPulse className="w-24 h-4" />
    </div>
    <SkeletonPulse className="w-full h-8" />
    <SkeletonPulse className="w-full h-8" />
    <SkeletonPulse className="w-3/4 h-8" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-5 space-y-3">
    <div className="flex items-center gap-2">
      <SkeletonPulse className="w-7 h-7 rounded-lg" />
      <SkeletonPulse className="w-32 h-4" />
    </div>
    <div className="flex items-end gap-1 h-32">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className="flex-1 rounded-t-sm"
          style={{ height: `${30 + Math.random() * 70}%` } as React.CSSProperties}
        />
      ))}
    </div>
  </div>
);
