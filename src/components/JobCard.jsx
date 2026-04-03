import { useState } from "react";
import {
  MapPin,
  Building2,
  CalendarDays,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import {
  cx,
  getFirstValue,
  extractWorkStyle,
  extractSalary,
  sanitizeBenefits,
  formatHtmlDescription,
  formatDisplayDate,
  scorePillClasses,
} from "../lib/utils";

export function JobCard({ job, isApplied, appliedAt, onMarkApplied, onUnmarkApplied }) {
  const [descOpen, setDescOpen] = useState(false);

  const title = getFirstValue(job, ["title"]);
  const company = getFirstValue(job, ["companyname", "company_name"]);
  const salary = extractSalary(job);
  const location = getFirstValue(job, ["location"]);
  const applyUrl = getFirstValue(job, ["applyurl", "linkedinlink"]);
  const companyUrl = getFirstValue(job, ["companylinkedinurl", "companywebsite"]);
  const postedAt = getFirstValue(job, ["postedat"]);
  const goNoGo = getFirstValue(job, ["go_nogo"]);
  const notes = getFirstValue(job, ["eval_notes"]);
  const missionAlignment = getFirstValue(job, ["mission_alignment"]);
  const domainFit = getFirstValue(job, ["domain_technical_fit"]);
  const leadershipFit = getFirstValue(job, ["leasership_scope_fit", "leadership_scope_fit"]);
  const competitiveness = getFirstValue(job, ["overall_competitiveness"]);
  const bluf = getFirstValue(job, ["bluf_match"]);
  const applicants = getFirstValue(job, ["applicantscount"]);
  const employmentType = getFirstValue(job, ["employmenttype"]);
  const seniority = getFirstValue(job, ["senioritylevel"]);
  const industries = getFirstValue(job, ["industries"]);
  const jobFunction = getFirstValue(job, ["jobfunction"]);
  const benefits = sanitizeBenefits(getFirstValue(job, ["benefits"]));
  const workStyle = extractWorkStyle(job);

  const goNoGoNorm = String(goNoGo).toLowerCase();
  const isGo = goNoGoNorm === "go";
  const isConditional = /conditional/i.test(goNoGo);

  const scores = [
    { label: "Mission", value: missionAlignment },
    { label: "Domain", value: domainFit },
    { label: "Leadership", value: leadershipFit },
    { label: "Competitive", value: competitiveness },
  ].filter((s) => s.value);

  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border transition-shadow",
        isApplied
          ? "border-emerald-800/40 bg-[#0b1210] shadow-[0_0_0_1px_rgba(52,211,153,0.06),0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-red-950/60 bg-[#0f0709] shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
      )}
    >
      {/* Applied banner */}
      {isApplied && (
        <div className="flex items-center gap-2 border-b border-emerald-800/25 bg-emerald-900/15 px-5 py-2 text-xs text-emerald-300/75">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Applied {appliedAt ? formatDisplayDate(appliedAt) : ""}
        </div>
      )}

      {/* Card header */}
      <div className="p-5">
        {/* Tag row */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cx(
              "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
              isConditional
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : isGo
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            )}
          >
            {goNoGo || "Unrated"}
          </span>
          {workStyle.map((s) => (
            <span
              key={s}
              className="rounded-full border border-red-800/35 bg-red-900/12 px-2.5 py-0.5 text-[11px] text-red-200/60"
            >
              {s}
            </span>
          ))}
          {employmentType && (
            <span className="rounded-full border border-red-950/70 bg-black/20 px-2.5 py-0.5 text-[11px] text-red-200/45">
              {employmentType}
            </span>
          )}
          {seniority && (
            <span className="rounded-full border border-red-950/70 bg-black/20 px-2.5 py-0.5 text-[11px] text-red-200/45">
              {seniority}
            </span>
          )}
        </div>

        {/* Title + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-snug text-red-50/90">{title || "Untitled role"}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-red-100/50">
              {company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {company}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {location}
                </span>
              )}
              {salary && (
                <span className="inline-flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 shrink-0" />
                  {salary}
                </span>
              )}
              {postedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {formatDisplayDate(postedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              onClick={() => (isApplied ? onUnmarkApplied(job) : onMarkApplied(job))}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition",
                isApplied
                  ? "border-emerald-700/45 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30"
                  : "border-red-800/45 bg-red-950/35 text-red-200/65 hover:bg-red-900/25 hover:text-red-200/85"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isApplied ? "Applied ✓" : "Mark Applied"}
            </button>
            {companyUrl && (
              <a
                href={companyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-red-900/45 bg-red-950/25 px-3 py-1.5 text-xs text-red-200/55 transition hover:bg-red-900/25"
              >
                Co. <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-700/55 bg-red-800/18 px-3 py-1.5 text-xs font-medium text-red-100/82 transition hover:bg-red-800/28"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Score chips + metadata */}
        {(scores.length > 0 || jobFunction || industries || applicants) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scores.map(({ label, value }) => (
              <span
                key={label}
                className={cx(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs",
                  scorePillClasses(value)
                )}
              >
                <span className="opacity-60">{label}</span>
                <span className="font-bold">{value}</span>
              </span>
            ))}
            {jobFunction && (
              <span className="rounded-full bg-red-950/25 px-2.5 py-0.5 text-xs text-red-100/38">
                {jobFunction}
              </span>
            )}
            {industries && (
              <span className="rounded-full bg-red-950/25 px-2.5 py-0.5 text-xs text-red-100/38">
                {industries}
              </span>
            )}
            {applicants && (
              <span className="rounded-full bg-red-950/25 px-2.5 py-0.5 text-xs text-red-100/38">
                {applicants} applicants
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary / notes body */}
      {(bluf || notes || benefits) && (
        <div className="space-y-3 border-t border-red-950/40 px-5 py-4">
          {bluf && <p className="text-sm leading-relaxed text-red-50/65">{bluf}</p>}
          {notes && bluf && <hr className="border-red-950/50" />}
          {notes && <p className="text-sm leading-relaxed text-red-100/52">{notes}</p>}
          {benefits && (
            <div className="rounded-xl border border-red-950/40 bg-black/12 px-3 py-2 text-xs text-red-100/42">
              <span className="mr-2 text-[10px] uppercase tracking-wider text-red-300/35">Benefits</span>
              {benefits}
            </div>
          )}
        </div>
      )}

      {/* Description expand */}
      <div className="border-t border-red-950/40">
        <button
          onClick={() => setDescOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-red-950/15"
        >
          <span className="text-[10px] uppercase tracking-[0.22em] text-red-300/40">
            Full description
          </span>
          {descOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-red-300/40" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-red-300/40" />
          )}
        </button>
        {descOpen && (
          <div
            className="prose prose-invert prose-sm prose-p:text-red-50/62 prose-li:text-red-50/62 prose-strong:text-red-50/78 prose-headings:text-red-50/78 prose-a:text-red-300/78 max-w-none px-5 pb-5"
            dangerouslySetInnerHTML={{ __html: formatHtmlDescription(job) }}
          />
        )}
      </div>
    </div>
  );
}
