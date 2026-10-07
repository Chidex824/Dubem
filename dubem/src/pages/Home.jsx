import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobs } from "../mock/jobs.js";
import JobCard from "../components/JobCard.jsx";
import Icon from "../components/Icon.jsx";

const REGIONS = ["Africa", "Remote-Global", "Europe", "North America", "Asia"];

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");

  function search(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (region) p.set("region", region);
    if (type) p.set("type", type);
    navigate(`/opportunities${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <>
      <div className="hero">
        <h2>Opportunities from verified organizations, in one place</h2>
        <p className="sub">Jobs, internships and fellowships across Africa and the world. Every listing is reviewed before it goes live.</p>

        <form className="searchbar" role="search" onSubmit={search}>
          <label className="sr" htmlFor="q">Search</label>
          <input className="input" id="q" type="search" autoComplete="off"
                 placeholder="Job title, skill or organization"
                 value={q} onChange={(e) => setQ(e.target.value)} />

          <label className="sr" htmlFor="region">Region</label>
          <select className="select" id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Anywhere</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>

          <label className="sr" htmlFor="ptype">Type</label>
          <select className="select" id="ptype" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="fellowship">Fellowships</option>
            <option value="volunteer">Volunteer</option>
          </select>

          <button className="btn btn-primary" type="submit"><Icon name="search" />Search</button>
        </form>

        <div className="regions" role="group" aria-label="Quick regions">
          {REGIONS.map((r) => (
            <button key={r} aria-pressed="false" onClick={() => navigate(`/opportunities?region=${encodeURIComponent(r)}`)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="latest" aria-label="Just posted">
        <strong>Just posted</strong>
        <div className="latest-row">
          {jobs.slice(0, 4).map((j) => (
            <div className="latest-item" key={j.slug}>
              <b>{j.title}</b><span>{j.org}, {j.when}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 24px" }}>
        <div className="sec-head">
          <h3>Latest opportunities</h3>
          <Link to="/opportunities">See all</Link>
        </div>
        <div className="jobs">
          {jobs.slice(0, 5).map((j) => <JobCard key={j.slug} job={j} />)}
        </div>
      </div>

      <div className="follow">
        <div>
          <h3>Get new listings where you already are</h3>
          <p>Follow Dubem on WhatsApp or Telegram, or create an account to get alerts for the searches you care about.</p>
        </div>
        <div className="acts">
          <a className="btn btn-primary" href="#">WhatsApp channel</a>
          <a className="btn btn-ghost" href="#">Telegram</a>
          <Link className="btn btn-ghost" to="/signup"><Icon name="bell" small />Create alerts</Link>
        </div>
      </div>
    </>
  );
}