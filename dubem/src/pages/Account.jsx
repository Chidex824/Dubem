import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const initialAlerts = [
  { id: 1, name: "Remote Django jobs",      chips: ["Job", "Remote-Global"],   freq: "instant", on: true },
  { id: 2, name: "Internships in Nigeria",  chips: ["Internship", "Nigeria"],  freq: "daily",   on: true },
  { id: 3, name: "Fellowships in Africa",   chips: ["Fellowship", "Africa"],   freq: "daily",   on: false },
];

const initialSaved = [
  { id: 1, title: "Programme Intern, Climate Policy", where: "Sahel Climate Lab, Abuja", closes: "Closes in 6 days",  tone: "warn" },
  { id: 2, title: "Frontend Developer (React)",       where: "Lumen Payments, Lagos",    closes: "Closes in 3 weeks", tone: "info" },
];

const TYPES = ["Job", "Internship", "Fellowship", "Volunteer"];
const REGIONS = ["Africa", "Remote-Global", "Europe", "North America", "Asia"];

export default function Account() {
  const { user } = useAuth();
  const firstName = user ? user.name.split(" ")[0] : "there";

  const [alerts, setAlerts] = useState(initialAlerts);
  const [saved, setSaved] = useState(initialSaved);
  const [form, setForm] = useState({ q: "", type: "Job", region: "Africa" });

  const changeAlert = (id, changes) =>
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const deleteAlert = (id) => setAlerts(alerts.filter((a) => a.id !== id));
  const removeSaved = (id) => setSaved(saved.filter((s) => s.id !== id));

  function addAlert(e) {
    e.preventDefault();
    const name = form.q.trim() ? `${form.q.trim()}` : `${form.type} in ${form.region}`;
    setAlerts([...alerts, { id: Date.now(), name, chips: [form.type, form.region], freq: "daily", on: true }]);
    setForm({ ...form, q: "" });
  }

  return (
    <section className="panel pad">
      <div className="acct">
        <nav className="side-nav" aria-label="Account">
          <Link to="/account" aria-current="page"><Icon name="bell" />Alerts</Link>
          <Link to="/account"><Icon name="bookmark" />Saved jobs</Link>
          <Link to="/account"><Icon name="upload" />CV</Link>
          <Link to="/account"><Icon name="user" />Profile</Link>
        </nav>

        <div className="acct-main">
          <div>
            <h2>Hello, {firstName}</h2>
            <div className="banner banner-ok" style={{ marginTop: 10, display: "inline-flex" }}>
              <Icon name="shield" />Email verified
            </div>
          </div>

          <section aria-labelledby="al-h">
            <div className="sec-head">
              <h3 id="al-h">Saved searches and alerts</h3>
              <span className="note">{alerts.length} {alerts.length === 1 ? "search" : "searches"}</span>
            </div>

            <div className="rows">
              {alerts.map((a) => (
                <div className="row" key={a.id}>
                  <div className="grow">
                    <b>{a.name}</b>
                    <div className="meta">
                      {a.chips.map((c) => <span className="chip" key={c}>{c}</span>)}
                    </div>
                  </div>
                  <div className="row-tools">
                    <div className="seg freq" role="group" aria-label="Frequency">
                      <button aria-pressed={a.freq === "instant"} onClick={() => changeAlert(a.id, { freq: "instant" })}>Instant</button>
                      <button aria-pressed={a.freq === "daily"} onClick={() => changeAlert(a.id, { freq: "daily" })}>Daily</button>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={a.on} aria-label="Alert on"
                             onChange={(e) => changeAlert(a.id, { on: e.target.checked })} />
                      <span></span>
                    </label>
                    <button className="icon-btn del" aria-label="Delete alert" onClick={() => deleteAlert(a.id)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <form className="new-alert" onSubmit={addAlert}>
              <div className="field">
                <label htmlFor="na-q">Keyword</label>
                <input className="input" id="na-q" placeholder="For example, data analyst"
                       value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="na-t">Type</label>
                <select className="select" id="na-t" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="na-r">Region</label>
                <select className="select" id="na-r" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" type="submit"><Icon name="plus" />Add alert</button>
            </form>
            <p className="note" style={{ marginTop: 8 }}>Alerts are sent by email. You can unsubscribe from any alert with one click.</p>
          </section>

          <section aria-labelledby="sj-h">
            <div className="sec-head">
              <h3 id="sj-h">Saved jobs</h3>
              <Link to="/account">See all 7</Link>
            </div>
            <div className="rows">
              {saved.map((s) => (
                <div className="row" key={s.id}>
                  <div className="grow"><b>{s.title}</b><span className="note">{s.where}</span></div>
                  <div className="row-tools">
                    <span className={`pill pill-${s.tone}`}>{s.closes}</span>
                    <button className="icon-btn del" aria-label="Remove saved job" onClick={() => removeSaved(s.id)}>
                      <Icon name="trash" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashed" aria-labelledby="cv-h">
            <div>
              <h3 id="cv-h" style={{ fontSize: "1.05rem" }}>Upload your CV once</h3>
              <p>Reuse it on every application. This arrives in a later release.</p>
            </div>
            <button className="btn btn-ghost" disabled type="button"><Icon name="upload" />Upload CV</button>
          </section>
        </div>
      </div>
    </section>
  );
}