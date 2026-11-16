import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function JobCard({ job }) {
  const [saved, setSaved] = useState(false);
  const jobType = job.typeLabel || "Role";
  const jobMode = job.modeLabel || (typeof job.mode === "string" ? job.mode[0].toUpperCase() + job.mode.slice(1) : "");
  const extras = Array.isArray(job.extra) ? job.extra : [];

  return (
    <article className="job">
      <div className="logo-tile" aria-hidden="true">{job.initials}</div>
      <div>
        <h4><Link to={`/jobs/${job.slug}`}>{job.title}</Link></h4>
        <div className="job-org">
          {job.org}{" "}
          <span className="verified"><Icon name="shield" small />Verified</span>
        </div>
        <div className="job-chips">
          <span className="chip chip-solid">{jobType}</span>
          <span className="chip"><Icon name="pin" small />{job.location}</span>
          {jobMode && <span className="chip">{jobMode}</span>}
          {extras.map((e) => <span className="chip" key={e}>{e}</span>)}
        </div>
      </div>
      <div className="job-side">
        <button className="save" aria-label="Save job" aria-pressed={saved} onClick={() => setSaved(!saved)}>
          <Icon name="bookmark" />
        </button>
        <span className="pay">{job.pay}</span>
        <span className="when">{job.when || "Recently"}</span>
      </div>
    </article>
  );
}