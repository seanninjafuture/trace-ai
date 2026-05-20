export function CanvasLoadingSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col gap-4 bg-bg-base p-6"
      aria-busy
      aria-label="Connecting to workspace"
    >
      <div className="h-4 w-48 animate-pulse rounded-md bg-bg-surface" />
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border-default bg-bg-surface">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-border-default border-t-accent-primary" />
        </div>
      </div>
    </div>
  );
}
