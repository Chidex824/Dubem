import { useSearchParams } from "react-router-dom";
import { jobs } from "../mock/Jobs.js";
import JobCard from "../components/JobCard.jsx";
import Icon from "../components/Icon.jsx";

const REGIONS = ["Africa", "Remote-Global", "Europe", "North America", "Asia"];
const TYPES = [["job", "Jobs"], ["internship", "Internships"], ["fellowship", "Fellowships"], ["volunteer", "Volunteer"]];
const MODES = [["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "Onsite"]];

export default function Home({ type }) {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") || "";
  const region = params.get("region") || "";
  const list = (key) => (params.get(key) ? params.get(key).split(",") : []);
  const types = type ? [type] : list("type");   // /jobs fixes the type, /opportunities uses ?type=
  const modes = list("mode");

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  }

  function toggleInList(key, value) {
    const current = list(key);
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, updated.join(","));
  }

  const shown = jobs.filter((j) =>
    (!types.length || types.includes(j.type)) &&
    (!modes.length || modes.includes(j.mode)) &&
    (!region || j.region === region) &&
    (!q || `${j.title} ${j.org}`.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <div className="hero">
        <h2>Opportunities from verified organizations, in one place</h2>
        <p className="sub">Jobs, internships and fellowships across Africa and the world. Every listing is reviewed before it goes live.</p>

        <form className="searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
          <label className="sr" htmlFor="q">Search</label>
          <input className="input" id="q" type="search" placeholder="Job title, skill or organization"
                 value={q} onChange={(e) => setParam("q", e.target.value)} />
          <label className="sr" htmlFor="region">Region</label>
          <select className="select" id="region" value={region} onChange={(e) => setParam("region", e.target.value)}>
            <option value="">Anywhere</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button className="btn btn-primary" type="submit"><Icon name="search" />Search</button>
        </form>

        <div className="regions" role="group" aria-label="Quick regions">
          {REGIONS.map((r) => (
            <button key={r} aria-pressed={region === r} onClick={() => setParam("region", region === r ? "" : r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="board">
        <aside className="filters" aria-label="Filters">
          <fieldset><legend>Type</legend>
            {TYPES.map(([v, label]) => (
              <label key={v}><input type="checkbox" checked={types.includes(v)} disabled={!!type}
                                    onChange={() => toggleInList("type", v)} /> {label}</label>
            ))}
          </fieldset>
          <fieldset><legend>Work mode</legend>
            {MODES.map(([v, label]) => (
              <label key={v}><input type="checkbox" checked={modes.includes(v)}
                                    onChange={() => toggleInList("mode", v)} /> {label}</label>
            ))}
          </fieldset>
        </aside>

        <div>
          <div className="board-head"><h3>{shown.length} opportunities</h3></div>
          <div className="jobs">
            {shown.length === 0 && <p className="note">Nothing matches these filters.</p>}
            {shown.map((j) => <JobCard key={j.slug} job={j} />)}
          </div>
        </div>
      </div>
    </>
  );
}