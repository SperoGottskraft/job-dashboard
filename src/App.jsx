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

  // All filter/sort state is persisted to localStorage
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
    // date (default) — newest scraped first
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#2a0a10_0%,#0e0405_50%,#080204_100%)] text-red-50/80">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-red-800/30 bg-red-900/12 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-red-300/55">
                <Briefcase className="h-3 w-3" />
                Job Signal Board
              </div>
              <h1 className="text-3xl font-black tracking-tight text-red-50/90">
                Daily Job Report
              </h1>
            </div>

            <div className="flex items-center gap-2.5 mt-1">
              {lastFetchedAt && (
                <span className="text-xs text-red-300/35">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-800/45 bg-red-950/35 px-3 py-1.5 text-xs text-red-200/65 transition hover:bg-red-900/28 disabled:opacity-40"
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
                className="rounded-xl border border-red-950/55 bg-[#110608]/60 px-4 py-3"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-red-300/38">
                  {label}
                </div>
                <div className="mt-1 text-2xl font-bold text-red-50/78">{value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <div className="mb-5 rounded-xl border border-red-950/55 bg-[#0c0507]/80 p-3 backdrop-blur">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">

            {/* Search */}
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-red-950/70 bg-black/18 px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-red-300/38" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, company, notes…"
                className="w-full bg-transparent text-sm text-red-50/78 outline-none placeholder:text-red-200/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[11px] text-red-300/38 hover:text-red-300/65"
                >
                  ✕
                </button>
              )}
            </label>

            {/* Date filter */}
            <div className="flex items-center gap-1.5 rounded-lg border border-red-950/70 bg-black/18 px-3 py-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-red-300/38" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!dateFilterEnabled}
                className="bg-transparent text-sm text-red-50/72 outline-none disabled:opacity-40 cursor-pointer"
              >
                {availableDates.map((d) => (
                  <option key={d} value={d} className="bg-[#120608]">
                    {d}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setDateFilterEnabled((v) => !v)}
                className={cx(
                  "ml-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
                  dateFilterEnabled
                    ? "border-red-700/45 bg-red-900/18 text-red-200/72"
                    : "border-red-950 text-red-200/32 hover:text-red-200/55"
                )}
              >
                {dateFilterEnabled ? "On" : "Off"}
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 rounded-lg border border-red-950/70 bg-black/18 px-3 py-2">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-red-300/38 mr-1" />
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cx(
                    "rounded-md px-2 py-0.5 text-xs transition",
                    sortBy === opt.value
                      ? "bg-red-800/38 text-red-100/82 font-medium"
                      : "text-red-200/42 hover:text-red-200/62"
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
                      ? "border-red-700/45 bg-red-800/22 text-red-100/82"
                      : "border-red-950/70 bg-black/18 text-red-200/40 hover:text-red-200/62"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}

        {/* First-time loading skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error (still show cached jobs below if available) */}
        {error && !isLoading && (
          <div className="mb-4 rounded-xl border border-rose-800/45 bg-rose-950/12 p-5">
            <div className="mb-1 flex items-center gap-2 font-semibold text-rose-300/85">
              <WifiOff className="h-4 w-4" />
              Couldn't reach the sheet
            </div>
            <p className="text-sm text-rose-100/55">{error}</p>
            {jobs.length > 0 && (
              <p className="mt-2 text-xs text-rose-100/38">
                Showing cached data from {formatRelativeTime(lastFetchedAt)}.
              </p>
            )}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sortedJobs.length === 0 && (
          <div className="rounded-xl border border-red-950/55 bg-black/18 p-10 text-center">
            <p className="text-sm text-red-100/38">No jobs match the current filters.</p>
          </div>
        )}

        {/* Job list */}
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

        {/* Footer */}
        {jobs.length > 0 && lastFetchedAt && (
          <footer className="mt-8 text-center text-xs text-red-300/22">
            Sheet source: Google Sheets · Last synced {formatRelativeTime(lastFetchedAt)}
          </footer>
        )}
      </div>
    </div>
  );
}
