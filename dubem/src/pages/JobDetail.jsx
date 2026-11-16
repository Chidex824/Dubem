import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJob } from "../api/Jobs.js";

export default function JobDetail() {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getJob(slug)
      .then((data) => {
        if (active) setJob(data);
      })
      .catch(() => {
        if (active) setError("This listing could not be loaded right now.");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <section className="panel pad">
        <div className="card" style={{ maxWidth: 720, marginInline: "auto" }}>
          <h2>Listing unavailable</h2>
          <p>{error}</p>
          <Link className="btn btn-ghost" to="/opportunities">Back to listings</Link>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="panel pad">
        <div className="card" style={{ maxWidth: 720, marginInline: "auto" }}>
          <h2>Loading opportunity…</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="panel pad">
      <div className="card" style={{ maxWidth: 900, marginInline: "auto" }}>
        <div className="sec-head">
          <div>
            <p className="eyebrow">{job.typeLabel} · {job.modeLabel}</p>
            <h2>{job.title}</h2>
            <p className="note">{job.org} · {job.location}</p>
          </div>
          <a className="btn btn-primary" href={job.applyUrl} target="_blank" rel="noreferrer">Apply now</a>
        </div>

        <div className="job-detail-grid">
          <div>
            <h3>About this role</h3>
            <p>{job.summary || job.about || "This opportunity is ready to be explored."}</p>

            {job.responsibilities?.length > 0 && (
              <>
                <h3>Responsibilities</h3>
                <ul>
                  {job.responsibilities.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}

            {job.requirements?.length > 0 && (
              <>
                <h3>Requirements</h3>
                <ul>
                  {job.requirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}
          </div>

          <aside className="meta-box">
            <div><strong>Location:</strong> {job.location}</div>
            <div><strong>Pay:</strong> {job.pay || "Not stated"}</div>
            <div><strong>Closing:</strong> {job.closesAt ? new Date(job.closesAt).toLocaleDateString() : "Not stated"}</div>
            <div><strong>Posted:</strong> {job.when || "Recently"}</div>
          </aside>
        </div>

        <div className="actions" style={{ marginTop: 24 }}>
          <Link className="btn btn-ghost" to="/opportunities">Back to listings</Link>
        </div>
      </div>
    </section>
  );
}