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
      </div>
    </section>
  );
}