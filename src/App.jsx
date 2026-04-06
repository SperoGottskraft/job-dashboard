import { useMemo } from "react";
import {
  Search,
  CalendarDays,
  RefreshCw,
  Briefcase,
  Loader2,
  WifiOff,
  SlidersHorizontal,
} from "lucide-react";
import { useJobData } from "./hooks/useJobData";
import { useAppliedJobs } from "./hooks/useAppliedJobs";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { JobCard } from "./components/JobCard";
import { SkeletonCard } from "./components/SkeletonCard";
import { cx, parseDate, formatDateInput, sameLocalDay, formatRelativeTime } from "./lib/utils";

const SORT_OPTIONS = [
  { value: "date", label: "Newest" },
  { value: "score", label: "Top Score" },
  { value: "company", label: "Company A–Z" },
];

export default function App() {
  const { jobs, status, error, lastFetchedAt, refresh } = useJobData();
  const { appliedCount, markApplied, unmarkApplied, isApplied, getAppliedAt } = useAppliedJobs();

  const [search, setSearch] = useLocalStorage("jd_search", "");
  const [selectedDate, setSelectedDate] = useLocalStorage("jd_date", formatDateInput(new Date()));
  const [dateFilterEnabled, setDateFilterEnabled] = useLocalStorage("jd_date_enabled", true);
  const [goFilterEnabled, setGoFilterEnabled] = useLocalStorage("jd_go_filter", true);
  const [showOnlyRated, setShowOnlyRated] = useLocalStorage("jd_rated_only", false);
  const [showAppliedOnly, setShowAppliedOnly] = useLocalStorage("jd_applied_only", false);
  const [sortBy, setSortBy] = useLocalStorage("jd_sort", "date");

  const isLoading = status === "loading";
  const isRefreshing = status === "refreshing";

  const availableDates = useMemo(() => {
    const set = new Set();
    for (const job of jobs) {
      const d = parseDate(job.scrapedat || job.scraped_at || job.eval_ts);
      if (d) set.add(formatDateInput(d));
    }
    return [...set].sort((a, b) => (a < b ? 1 : -1));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const goNoGo = String(job.go_nogo || "").toLowerCase();
      const scraped = job.scrapedat || job.scraped_at || job.eval_ts;

      if (dateFilterEnabled && !sameLocalDay(scraped, selectedDate)) return false;
      if (goFilterEnabled && goNoGo !== "go" && goNoGo !== "conditional go") return false;
      if (showOnlyRated && !goNoGo) return false;
      if (showAppliedOnly && !isApplied(job)) return false;

      if (q) {
        const haystack = [
          job.title,
          job.companyname,
          job.location,
          job.salary,
          job.description_html,
          job.description,
          job.eval_notes,
          job.bluf_match,
          job.industries,
          job.jobfunction,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, search, selectedDate, dateFilterEnabled, goFilterEnabled, showOnlyRated, showAppliedOnly, isApplied]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    if (sortBy === "score") {
      return list.sort((a, b) => {
        const sa = Math.max(
          Number(a.overall_competitiveness || 0),
          Number(a.mission_alignment || 0)
        );
        const sb = Math.max(
          Number(b.overall_competitiveness || 0),
          Number(b.mission_alignment || 0)
        );
        return sb - sa;
      });
    }
    if (sortBy === "company") {
      return list.sort((a, b) =>
        String(a.companyname || "")
          .toLowerCase()
          .localeCompare(String(b.companyname || "").toLowerCase())
      );
    }
    return list.sort((a, b) => {
      const da = parseDate(a.scrapedat || a.scraped_at)?.getTime() ?? 0;
      const db = parseDate(b.scrapedat || b.scraped_at)?.getTime() ?? 0;
      return db - da;
    });
  }, [filteredJobs, sortBy]);

  const stats = useMemo(() => {
    const go = filteredJobs.filter((j) => String(j.go_nogo || "").toLowerCase() === "go").length;
    const conditional = filteredJobs.filter((j) => /conditional/i.test(j.go_nogo || "")).length;
    return { total: jobs.length, visible: filteredJobs.length, go, conditional };
  }, [jobs, filteredJobs]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#e2e8f0] bg-[#f1f5f9] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#64748b]">
                <Briefcase className="h-3 w-3" />
                Job Signal Board
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">
                Daily Job Report
              </h1>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              {lastFetchedAt && (
                <span className="text-xs text-[#94a3b8]">
                  {isRefreshing ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
                    </span>
                  ) : (
                    `Synced ${formatRelativeTime(lastFetchedAt)}`
                  )}
                </span>
              )}
              <button
                onClick={refresh}
                disabled={isLoading || isRefreshing}
                title="Force refresh from Google Sheets"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs text-[#64748b] transition hover:border-[#1d4ed8]/40 hover:text-[#1d4ed8] disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Visible", value: stats.visible },
              { label: "Go", value: stats.go },
              { label: "Conditional", value: stats.conditional },
              { label: "Applied", value: appliedCount },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                  {label}
                </div>
                <div className="mt-1 text-2xl font-bold text-[#0f172a]">{value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <div className="mb-5 rounded-xl border border-[#e2e8f0] bg-white p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

            {/* Search */}
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, company, notes…"
                className="w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[11px] text-[#94a3b8] hover:text-[#64748b]"
                >
                  ✕
                </button>
              )}
            </label>

            {/* Date filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!dateFilterEnabled}
                className="bg-transparent text-sm text-[#0f172a] outline-none disabled:opacity-40 cursor-pointer"
              >
                {availableDates.map((d) => (
                  <option key={d} value={d} className="bg-white">
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setDateFilterEnabled((v) => !v)}
                className={cx(
                  "ml-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
                  dateFilterEnabled
                    ? "border-[#1d4ed8]/40 bg-[#eff6ff] text-[#1d4ed8]"
                    : "border-[#e2e8f0] text-[#94a3b8] hover:text-[#64748b]"
                )}
              >
                {dateFilterEnabled ? "On" : "Off"}
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-[#94a3b8] mr-1" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cx(
                    "rounded-md px-2 py-0.5 text-xs transition",
                    sortBy === opt.value
                      ? "bg-[#1d4ed8] text-white font-medium"
                      : "text-[#94a3b8] hover:text-[#64748b]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Toggle filters */}
            <div className="flex gap-1.5">
              {[
                {
                  label: "Go only",
                  active: goFilterEnabled,
                  toggle: () => setGoFilterEnabled((v) => !v),
                },
                {
                  label: "Rated",
                  active: showOnlyRated,
                  toggle: () => setShowOnlyRated((v) => !v),
                },
                {
                  label: "Applied",
                  active: showAppliedOnly,
                  toggle: () => setShowAppliedOnly((v) => !v),
                },
              ].map(({ label, active, toggle }) => (
                <button
                  key={label}
                  onClick={toggle}
                  className={cx(
                    "rounded-lg border px-3 py-2 text-xs font-medium transition",
                    active
                      ? "border-[#1d4ed8]/40 bg-[#eff6ff] text-[#1d4ed8]"
                      : "border-[#e2e8f0] bg-[#f8fafc] text-[#94a3b8] hover:text-[#64748b]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-5">
            <div className="mb-1 flex items-center gap-2 font-semibold text-rose-700">
              <WifiOff className="h-4 w-4" />
              Couldn't reach the sheet
            </div>
            <p className="text-sm text-rose-600">{error}</p>
            {jobs.length > 0 && (
              <p className="mt-2 text-xs text-rose-400">
                Showing cached data from {formatRelativeTime(lastFetchedAt)}.
              </p>
            )}
          </div>
        )}

        {!isLoading && sortedJobs.length === 0 && (
          <div className="rounded-xl border border-[#e2e8f0] bg-white p-10 text-center">
            <p className="text-sm text-[#94a3b8]">No jobs match the current filters.</p>
          </div>
        )}

        {!isLoading && sortedJobs.length > 0 && (
          <div className="space-y-4">
            {sortedJobs.map((job, i) => (
              <JobCard
                key={
                  job.id ||
                  job.applyurl ||
                  job.linkedinlink ||
                  `${job.title}-${job.companyname}-${i}`
                }
                job={job}
                isApplied={isApplied(job)}
                appliedAt={getAppliedAt(job)}
                onMarkApplied={markApplied}
                onUnmarkApplied={unmarkApplied}
              />
            ))}
          </div>
        )}

        {jobs.length > 0 && lastFetchedAt && (
          <footer className="mt-8 text-center text-xs text-[#cbd5e1]">
            Sheet source: Google Sheets · Last synced {formatRelativeTime(lastFetchedAt)}
          </footer>
        )}
      </div>
    </div>
  );
}
