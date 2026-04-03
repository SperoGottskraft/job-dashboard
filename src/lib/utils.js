export function cx(...items) {
  return items.filter(Boolean).join(" ");
}

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime())) return direct;
    const m = trimmed.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)/);
    if (m) {
      const [, y, mo, d, hh = 0, mm = 0, ss = 0] = m.map(Number);
      return new Date(y, mo, d, hh, mm, ss);
    }
  }
  return null;
}

export function formatDateInput(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function sameLocalDay(dateA, yyyyMmDd) {
  const date = parseDate(dateA);
  if (!date || !yyyyMmDd) return true;
  return formatDateInput(date) === yyyyMmDd;
}

export function getFirstValue(job, keys) {
  for (const key of keys) {
    if (job[key] !== undefined && job[key] !== null && String(job[key]).trim() !== "") {
      return String(job[key]);
    }
  }
  return "";
}

export function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractWorkStyle(job) {
  const haystack = [
    getFirstValue(job, ["description_html", "description", "bluf_match", "eval_notes"]),
    getFirstValue(job, ["location"]),
    getFirstValue(job, ["benefits"]),
    getFirstValue(job, ["title"]),
  ]
    .join(" ")
    .toLowerCase();

  const flags = [];
  if (/\bremote\b/.test(haystack)) flags.push("Remote");
  if (/\bhybrid\b/.test(haystack)) flags.push("Hybrid");
  if (/on-?site|onsite|in office|in-office/.test(haystack)) flags.push("On-site");
  if (/9\/80/.test(haystack)) flags.push("9/80");
  return [...new Set(flags)];
}

export function extractSalary(job) {
  const direct = getFirstValue(job, ["salary"]);
  if (direct) return direct;

  const text = [getFirstValue(job, ["description_html"]), getFirstValue(job, ["description"])]
    .map(stripHtml)
    .join(" ");
  if (!text) return "";

  const patterns = [
    /(\$\s?\d{2,3}[\d,]*(?:\.\d+)?\s?(?:-|to|–|—)\s?\$\s?\d{2,3}[\d,]*(?:\.\d+)?(?:\s*\/?\s*(?:year|yr|annually|hour|hr))?)/i,
    /(\$\s?\d{2,3}[\d,]*(?:\.\d+)?\s*(?:k|K)\s?(?:-|to|–|—)\s?\$\s?\d{2,3}[\d,]*(?:\.\d+)?\s*(?:k|K))/i,
    /((?:salary|compensation|pay range|base salary)[:\s]{1,12}\$\s?\d{2,3}[\d,]*(?:\.\d+)?(?:\s?(?:-|to|–|—)\s?\$\s?\d{2,3}[\d,]*(?:\.\d+)?)?(?:\s*\/?\s*(?:year|yr|annually|hour|hr))?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/^(salary|compensation|pay range|base salary)[:\s]*/i, "").trim();
    }
  }
  return "";
}

export function sanitizeBenefits(value) {
  const text = String(value || "").trim();
  if (!text || /be an early applicant/i.test(text) || /actively hiring/i.test(text)) return "";
  return text;
}

export function formatHtmlDescription(job) {
  const html = getFirstValue(job, ["description_html"]);
  if (html) return html;
  const text = getFirstValue(job, ["description"]);
  if (!text) return "<p>No description available.</p>";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return (
    escaped
      .split(
        /\n{2,}|(?=Responsibilities|Qualifications|Requirements|Benefits|About the role|About Us|Why Join)/g
      )
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
      .join("") || `<p>${escaped}</p>`
  );
}

export function scorePillClasses(score) {
  const n = Number(score);
  if (n >= 4) return "bg-emerald-500/12 text-emerald-300 border-emerald-500/25";
  if (n >= 3) return "bg-amber-500/12 text-amber-300 border-amber-500/25";
  return "bg-rose-500/12 text-rose-300 border-rose-500/25";
}

export function jobKey(job) {
  return (
    getFirstValue(job, ["applyurl", "linkedinlink"]) ||
    `${getFirstValue(job, ["title"])}__${getFirstValue(job, ["companyname", "company_name"])}`
  );
}
