import useJobFilters from "../hooks/useJobFilters.jsx";
import JobBoard from "../components/JobBoard.jsx";
import Icon from "../components/Icon.jsx";

const REGIONS = ["Africa", "Remote-Global", "Europe", "North America", "Asia"];

export default function Opportunities({ type, title = "All opportunities" }) {
  const filters = useJobFilters(type);
  const { q, region, setParam } = filters;

  return (
    <>
      <div className="org-hero" style={{ paddingBlock: 28 }}>
        <h2 style={{ fontSize: "2rem" }}>{title}</h2>
        <form className="searchbar" role="search" style={{ marginTop: 16, gridTemplateColumns: "1.5fr 1fr auto" }}
              onSubmit={(e) => e.preventDefault()}>
          <label className="sr" htmlFor="oq">Search</label>
          <input className="input" id="oq" type="search" placeholder="Job title, skill or organization"
                 value={q} onChange={(e) => setParam("q", e.target.value)} />
          <label className="sr" htmlFor="oregion">Region</label>
          <select className="select" id="oregion" value={region} onChange={(e) => setParam("region", e.target.value)}>
            <option value="">Anywhere</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button className="btn btn-primary" type="submit"><Icon name="search" />Search</button>
        </form>
      </div>

      <JobBoard filters={filters} />
    </>
  );
}