import { useState } from "react";
import Icon from "../components/Icon.jsx";
import Field from "../components/Field.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const TYPES = ["Job", "Internship", "Fellowship", "Volunteer"];
const MODES = ["Remote", "Hybrid", "Onsite"];
const COUNTRIES = ["Remote-Global", "Nigeria", "Ghana", "Kenya", "United Kingdom"];

const blank = {
  type: "Job", mode: "Remote", title: "", country: "Remote-Global", city: "",
  pay: "", close: "", desc: "", link: "",
};

export default function Post() {
  const { user } = useAuth();
  const [form, setForm] = useState(blank);
  const [whatsapp, setWhatsapp] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="panel pad">
        <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="mailmark"><Icon name="check" /></div>
          <h2 style={{ marginTop: 14 }}>Submitted for review</h2>
          <p style={{ marginTop: 6 }}>
            <b>{form.title || "Your listing"}</b> is in the moderation queue. We will email you when it is live.
          </p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }}
                  onClick={() => { setForm(blank); setSubmitted(false); }}>
            Post another
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel pad">
      <div className="post">
        <div>
          <h2>Post an opportunity</h2>
          <p className="note">
            Posting as <b>{user ? user.name : "your organization"}</b>{" "}
            <span className="verified"><Icon name="shield" small />Verified</span>
          </p>

          <form className="form" onSubmit={submit}>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="po-type">Type</label>
                <select className="select" id="po-type" name="type" value={form.type} onChange={set}>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="po-mode">Work mode</label>
                <select className="select" id="po-mode" name="mode" value={form.mode} onChange={set}>
                  {MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <Field id="po-title" name="title" label="Title" value={form.title} onChange={set} required />

            <div className="grid-2">
              <div className="field">
                <label htmlFor="po-country">Country</label>
                <select className="select" id="po-country" name="country" value={form.country} onChange={set}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Field id="po-city" name="city" label="City or region" placeholder="Optional" value={form.city} onChange={set} />
            </div>

            <div className="grid-2">
              <Field id="po-pay" name="pay" label="Salary or stipend" value={form.pay} onChange={set}
                     hint="Listings with pay get more applications." />
              <Field id="po-close" name="close" type="date" label="Closing date" value={form.close} onChange={set} />
            </div>

            <div className="field">
              <label htmlFor="po-desc">Description</label>
              <textarea className="textarea" id="po-desc" name="desc" value={form.desc} onChange={set} required />
            </div>

            <Field id="po-link" name="link" label="How to apply" inputMode="url" value={form.link} onChange={set}
                   hint="A link or an email address. Applicants never pay a fee." required />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button className="btn btn-primary" type="submit">Submit for review</button>
              <button className="btn btn-ghost" type="button">Save draft</button>
            </div>
          </form>
        </div>

        <aside className="aside">
          <div className="card">
            <h3>What happens next</h3>
            <ol className="steps">
              <li data-n="1"><b>Submitted</b><span>You get a confirmation email.</span></li>
              <li data-n="2"><b>In review</b><span>We check the listing against our posting rules.</span></li>
              <li data-n="3"><b>Live on Dubem</b><span>The listing appears on the board and in search.</span></li>
              <li data-n="4"><b>Shared to channels</b><span>Posted to the channels you select below.</span></li>
            </ol>
          </div>

          <div className="card">
            <h3>Share to</h3>
            <div className="opts">
              <label>
                <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
                <span>WhatsApp channel<small>Posted when the listing is approved.</small></span>
              </label>
              <label>
                <input type="checkbox" disabled />
                <span>Telegram<small>Coming soon.</small></span>
              </label>
            </div>
          </div>

          <div className="banner banner-warn">
            <Icon name="flag" />
            <div>Listings that ask applicants to pay, or request IDs or bank details, are rejected.</div>
          </div>
        </aside>
      </div>
    </section>
  );
}