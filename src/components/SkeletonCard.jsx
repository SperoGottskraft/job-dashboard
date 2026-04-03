export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-red-950/50 bg-[#0f0709] animate-pulse">
      <div className="p-5">
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-14 rounded-full bg-red-900/30" />
          <div className="h-5 w-18 rounded-full bg-red-900/20" />
        </div>
        <div className="h-6 w-3/5 rounded-lg bg-red-900/25 mb-3" />
        <div className="flex gap-4 mb-4">
          <div className="h-3.5 w-28 rounded bg-red-900/18" />
          <div className="h-3.5 w-24 rounded bg-red-900/18" />
          <div className="h-3.5 w-32 rounded bg-red-900/18" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-red-900/15" />
          <div className="h-5 w-20 rounded-full bg-red-900/15" />
          <div className="h-5 w-20 rounded-full bg-red-900/15" />
        </div>
      </div>
      <div className="border-t border-red-950/40 px-5 py-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-red-900/12" />
        <div className="h-3.5 w-5/6 rounded bg-red-900/12" />
        <div className="h-3.5 w-4/6 rounded bg-red-900/12" />
      </div>
    </div>
  );
}
