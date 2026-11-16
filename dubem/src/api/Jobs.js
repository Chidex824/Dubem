const initialsOf = (value = "") => {
  const parts = String(value).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || "DU";
};
const TYPE_LABEL = { job: "Job", internship: "Internship", fellowship: "Fellowship", volunteer: "Volunteer" };
const MODE_LABEL = { remote: "Remote", hybrid: "Hybrid", onsite: "Onsite" };
const REGION_OF = {
  Africa: ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia", "Uganda", "Tanzania", "Rwanda", "Senegal", "Cameroon", "Morocco", "Côte d'Ivoire", "Zambia", "Zimbabwe", "Botswana", "Namibia", "Tunisia", "Algeria"],
  Europe: ["United Kingdom", "Germany", "France", "Ireland", "Netherlands", "Spain", "Italy", "Portugal", "Sweden", "Norway", "Denmark", "Belgium", "Switzerland", "Poland"],
  "North America": ["United States", "Canada", "Mexico"],
  Asia: ["India", "China", "Singapore", "United Arab Emirates", "Japan", "Pakistan", "Philippines", "Malaysia", "Indonesia"],
};
const regionOf = (c) => (!c || c === "Remote" ? "Remote-Global" : Object.entries(REGION_OF).find(([, l]) => l.includes(c))?.[0] || "Remote-Global");

function formatWhen(date) {
  if (!date) return "Recently";
  const diffDays = Math.round((new Date(date).getTime() - Date.now()) / 86400000);
  if (Math.abs(diffDays) < 1) return "Today";
  if (Math.abs(diffDays) < 7) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function prepare(raw) {
  const location = raw.country === "Remote" || !raw.country ? "Remote-Global" : raw.city ? `${raw.city}, ${raw.country}` : raw.country;
  return {
    ...raw,
    postedAt: raw.postedAt ? new Date(raw.postedAt) : null,
    closesAt: raw.closesAt ? new Date(`${raw.closesAt}T23:59:59`) : null,
    location,
    region: regionOf(raw.country),
    initials: initialsOf(raw.org || raw.organization || "Dubem"),
    typeLabel: TYPE_LABEL[raw.type] || raw.type,
    modeLabel: MODE_LABEL[raw.mode] || raw.mode,
    responsibilities: raw.responsibilities || [],
    requirements: raw.requirements || [],
    when: raw.when || formatWhen(raw.postedAt),
  };
}

export async function getJobs() {
  const all = [];
  let url = `${API}/api/jobs/?page_size=200`;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load listings (${res.status})`);
    const page = await res.json();
    all.push(...page.results);
    url = page.next;
  }
  return all.map(prepare);
}

export async function getJob(slug) {
  const res = await fetch(`${API}/api/jobs/${encodeURIComponent(slug)}/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Could not load listing (${res.status})`);
  return prepare(await res.json());
}
