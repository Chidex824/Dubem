import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import { login as loginRequest } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const HOME_FOR = { seeker: "/account", org: "/post", admin: "/admin" };

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await loginRequest(form.email.trim(), form.password);
      signIn(result.user, result.token);
      const target = from || HOME_FOR[result.user?.role] || "/";
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Could not sign you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel pad">
      <div className="card" style={{ maxWidth: 440, marginInline: "auto" }}>
        <h2>Sign in</h2>
        <p className="note">Welcome back. Sign in to see your alerts, saved jobs and listings.</p>

        <form className="form" onSubmit={submit}>
          <Field id="li-mail" name="email" type="email" label="Email" autoComplete="email"
                 value={form.email} onChange={set} required />
          <Field id="li-pw" name="password" type="password" label="Password" autoComplete="current-password"
                 value={form.password} onChange={set} required />

          {error && <div className="banner banner-bad"><div>{error}</div></div>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
          <p className="note"><Link to="/login">Forgot your password?</Link></p>
          <p className="note">New to Dubem? <Link to="/signup">Create an account</Link></p>
        </form>
      </div>
    </section>
  );
}