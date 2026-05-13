export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-4xl animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-36 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded bg-muted/60" />
      </div>

      {/* Main card skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/30 p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-72 rounded bg-muted/60" />
          </div>
          <div className="h-9 w-24 rounded-lg bg-muted shrink-0" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-5">
            <div className="h-3 w-28 rounded bg-muted/60 mb-3" />
            <div className="h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* List skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-5 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
