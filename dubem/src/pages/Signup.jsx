import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import Field from "../components/Field.jsx";

export default function Signup() {
  const [params] = useSearchParams();
  const status = params.get("status");               // ?status=verified or ?status=expired

  const [hiring, setHiring] = useState(false);
  const [form, setForm] = useState({ name: "", site: "", email: "", password: "", agree: false });
  const [sentTo, setSentTo] = useState(null);         // email address once submitted
  const [seconds, setSeconds] = useState(0);          // resend countdown

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function submit(e) {
    e.preventDefault();
    setSentTo(form.email);
    setSeconds(60);
  }

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="panel pad">
      <div className="two">
        <div className="card">
          <h2>Create your account</h2>
          <p className="note">One account for saved jobs and alerts, or to post opportunities for your organization.</p>

          <form className="form" onSubmit={submit}>
            <div className="role" role="group" aria-label="Account type">
              <button type="button" aria-pressed={!hiring} onClick={() => setHiring(false)}>I am looking</button>
              <button type="button" aria-pressed={hiring} onClick={() => setHiring(true)}>I am hiring</button>
            </div>

            <Field id="su-name" name="name" label={hiring ? "Organization name" : "Full name"}
                   value={form.name} onChange={set} autoComplete={hiring ? "organization" : "name"} required />

            {hiring && (
              <Field id="su-site" name="site" label="Organization website" placeholder="https://yourorganization.org"
                     inputMode="url" value={form.site} onChange={set}
                     hint="We check the website before your first listing goes live." />
            )}

            <Field id="su-mail" name="email" type="email" label="Email"
                   value={form.email} onChange={set} autoComplete="email" required />
            <Field id="su-pw" name="password" type="password" label="Password"
                   value={form.password} onChange={set} autoComplete="new-password" minLength={10}
                   hint="At least 10 characters." required />

            <label className="check">
              <input type="checkbox" name="agree" checked={form.agree} onChange={set} required />
              I agree to the Terms and the Privacy Policy.
            </label>

            <button className="btn btn-primary" type="submit">Create account</button>
            <p className="note">Already registered? <Link to="/signup">Sign in</Link></p>
          </form>
        </div>

        <div className="card">
          <div className="mailmark"><Icon name="mail" /></div>
          <h2 style={{ marginTop: 14 }}>Check your email</h2>
          <p style={{ marginTop: 6 }}>
            {sentTo
              ? <>We sent a verification link to <b>{sentTo}</b>. It expires in 24 hours.</>
              : "Fill in the form and we will send you a verification link."}
          </p>

          {sentTo && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, alignItems: "center" }}>
                <button className="btn btn-primary" type="button" disabled={seconds > 0} onClick={() => setSeconds(60)}>
                  Resend email
                </button>
                <button className="btn btn-quiet" type="button" onClick={() => setSentTo(null)}>Use a different email</button>
              </div>
              {seconds > 0 && <p className="note" style={{ marginTop: 8 }}>You can resend in {mmss}</p>}
            </>
          )}

          <div className="states">
            {status === "verified" && (
              <div className="banner banner-ok"><Icon name="check" />
                <div><b>Email verified.</b> You can now save jobs and create alerts.</div></div>
            )}
            {status === "expired" && (
              <div className="banner banner-bad"><Icon name="clock" />
                <div><b>This link has expired.</b> Request a new verification email to continue.</div></div>
            )}
          </div>

          <p className="note" style={{ marginTop: 12 }}>
            Until your email is verified you can browse and apply, but you cannot save jobs, create alerts or post.
          </p>
        </div>
      </div>
    </section>
  );
}