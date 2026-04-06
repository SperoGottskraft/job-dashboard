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
          ? "border-emerald-200 bg-white shadow-sm"
          : "border-[#e2e8f0] bg-white hover:border-[#1d4ed8]/30 hover:shadow-sm"
      )}
    >
      {/* Applied banner */}
      {isApplied && (
        <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-2 text-xs text-emerald-700">
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
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : isGo
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {goNoGo || "Unrated"}
          </span>
          {workStyle.map((s) => (
            <span
              key={s}
              className="rounded-full border border-[#e2e8f0] bg-[#f1f5f9] px-2.5 py-0.5 text-[11px] text-[#64748b]"
            >
              {s}
            </span>
          ))}
          {employmentType && (
            <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-0.5 text-[11px] text-[#94a3b8]">
              {employmentType}
            </span>
          )}
          {seniority && (
            <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-0.5 text-[11px] text-[#94a3b8]">
              {seniority}
            </span>
          )}
        </div>

        {/* Title + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold leading-snug text-[#0f172a]">{title || "Untitled role"}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748b]">
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
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] hover:border-[#1d4ed8]/30 hover:text-[#1d4ed8]"
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
                className="inline-flex items-center gap-1 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs text-[#64748b] transition hover:border-[#1d4ed8]/30 hover:text-[#1d4ed8]"
              >
                Co. <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#1d4ed8]/40 bg-[#eff6ff] px-3 py-1.5 text-xs font-medium text-[#1d4ed8] transition hover:bg-[#dbeafe]"
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
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs text-[#94a3b8]">
                {jobFunction}
              </span>
            )}
            {industries && (
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs text-[#94a3b8]">
                {industries}
              </span>
            )}
            {applicants && (
              <span className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-xs text-[#94a3b8]">
                {applicants} applicants
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary / notes body */}
      {(bluf || notes || benefits) && (
        <div className="space-y-3 border-t border-[#e2e8f0] px-5 py-4">
          {bluf && <p className="text-sm leading-relaxed text-[#0f172a]">{bluf}</p>}
          {notes && bluf && <hr className="border-[#e2e8f0]" />}
          {notes && <p className="text-sm leading-relaxed text-[#64748b]">{notes}</p>}
          {benefits && (
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-xs text-[#64748b]">
              <span className="mr-2 text-[10px] uppercase tracking-wider text-[#94a3b8]">Benefits</span>
              {benefits}
            </div>
          )}
        </div>
      )}

      {/* Description expand */}
      <div className="border-t border-[#e2e8f0]">
        <button
          onClick={() => setDescOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-[#f8fafc]"
        >
          <span className="text-[10px] uppercase tracking-[0.22em] text-[#94a3b8]">
            Full description
          </span>
          {descOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-[#94a3b8]" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
          )}
        </button>
        {descOpen && (
          <div
            className="prose prose-sm prose-p:text-[#64748b] prose-li:text-[#64748b] prose-strong:text-[#0f172a] prose-headings:text-[#0f172a] prose-a:text-[#1d4ed8] max-w-none px-5 pb-5"
            dangerouslySetInnerHTML={{ __html: formatHtmlDescription(job) }}
          />
        )}
      </div>
    </div>
  );
}
