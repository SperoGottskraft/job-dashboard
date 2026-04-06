export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white animate-pulse">
      <div className="p-5">
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-14 rounded-full bg-[#f1f5f9]" />
          <div className="h-5 w-18 rounded-full bg-[#f1f5f9]" />
        </div>
        <div className="h-6 w-3/5 rounded-lg bg-[#f1f5f9] mb-3" />
        <div className="flex gap-4 mb-4">
          <div className="h-3.5 w-28 rounded bg-[#f8fafc]" />
          <div className="h-3.5 w-24 rounded bg-[#f8fafc]" />
          <div className="h-3.5 w-32 rounded bg-[#f8fafc]" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-[#f1f5f9]" />
          <div className="h-5 w-20 rounded-full bg-[#f1f5f9]" />
          <div className="h-5 w-20 rounded-full bg-[#f1f5f9]" />
        </div>
      </div>
      <div className="border-t border-[#e2e8f0] px-5 py-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-[#f8fafc]" />
        <div className="h-3.5 w-5/6 rounded bg-[#f8fafc]" />
        <div className="h-3.5 w-4/6 rounded bg-[#f8fafc]" />
      </div>
    </div>
  );
}
