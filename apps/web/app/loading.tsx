export default function Loading() {
  return (
    <div className="animate-fadeIn">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-[--color-surface] animate-pulse" />
          <div className="h-4 w-28 rounded-md bg-[--color-surface] animate-pulse" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-[--color-surface] animate-pulse" />
      </div>

      {/* Habit grid skeleton */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} delay={i * 80} />
        ))}
      </div>

      {/* Weekly heatmap skeleton */}
      <div className="mt-10">
        <div className="h-5 w-36 rounded-md bg-[--color-surface] animate-pulse mb-4" />
        <div className="card-surface p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-20 rounded bg-[--color-surface] animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div
                    key={j}
                    className="heatmap-cell bg-[--color-surface] animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="card-surface p-5 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[--color-muted] opacity-20" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-[--color-muted] opacity-20" />
            <div className="h-3 w-16 rounded bg-[--color-muted] opacity-20" />
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-[--color-muted] opacity-20" />
      </div>
    </div>
  );
}
