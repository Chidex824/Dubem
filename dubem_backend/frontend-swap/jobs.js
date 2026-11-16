// Drop-in replacement for src/api/jobs.js once the Django API is running.
// Same two exports, same fields, so no page or hook changes.
// Set VITE_API_URL (e.g. http://localhost:8000) in the frontend's .env; leave empty if you proxy /api in vite.config.js.
import { initialsOf } from "../lib/format.js";

const API = import.meta.env.VITE_API_URL || "";
const TYPE_LABEL = { job: "Job", internship: "Internship", fellowship: "Fellowship", volunteer: "Volunteer" };
const MODE_LABEL = { remote: "Remote", hybrid: "Hybrid", onsite: "Onsite" };
const REGION_OF = {
  Africa: ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia", "Uganda", "Tanzania", "Rwanda", "Senegal", "Cameroon", "Morocco", "Côte d'Ivoire", "Zambia", "Zimbabwe", "Botswana", "Namibia", "Tunisia", "Algeria"],
  Europe: ["United Kingdom", "Germany", "France", "Ireland", "Netherlands", "Spain", "Italy", "Portugal", "Sweden", "Norway", "Denmark", "Belgium", "Switzerland", "Poland"],
  "North America": ["United States", "Canada", "Mexico"],
  Asia: ["India", "China", "Singapore", "United Arab Emirates", "Japan", "Pakistan", "Philippines", "Malaysia", "Indonesia"],
};
const regionOf = (c) => (!c || c === "Remote" ? "Remote-Global" : Object.entries(REGION_OF).find(([, l]) => l.includes(c))?.[0] || "Remote-Global");

function prepare(raw) {
  const location = raw.country === "Remote" || !raw.country ? "Remote-Global" : raw.city ? `${raw.city}, ${raw.country}` : raw.country;
  return {
    ...raw,
    postedAt: new Date(raw.postedAt),
    closesAt: raw.closesAt ? new Date(`${raw.closesAt}T23:59:59`) : null,
    location,
    region: regionOf(raw.country),
    initials: initialsOf(raw.org),
    typeLabel: TYPE_LABEL[raw.type] || raw.type,
    modeLabel: MODE_LABEL[raw.mode] || raw.mode,
    responsibilities: raw.responsibilities || [],
    requirements: raw.requirements || [],
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
