import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Field from "../components/Field.jsx";
import { signup as signupRequest } from "../api/client.js";

export default function Signup() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const navigate = useNavigate();

  const [hiring, setHiring] = useState(false);
  const [form, setForm] = useState({ name: "", site: "", email: "", password: "", agree: false });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        terms: form.agree,
        hiring,
      };

      if (hiring) {
        payload.organization = form.name.trim();
        payload.website = form.site.trim();
      }

      await signupRequest(payload);
      navigate("/verify-email?status=sent");
    } catch (err) {
      setError(err.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel pad">
      <div className="two">
        <div className="card">
          <h2>Create your account</h2>
          <p className="note">One account for saved jobs and alerts, or to post opportunities for your organization.</p>

          {status === "verified" && (
            <div className="banner banner-ok"><div><b>Email verified.</b> You can now sign in and continue.</div></div>
          )}

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

            {error && <div className="banner banner-bad"><div>{error}</div></div>}

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </button>
            <p className="note">Already registered? <Link to="/login">Sign in</Link></p>
          </form>
        </div>
      </div>
    </section>
  );
}