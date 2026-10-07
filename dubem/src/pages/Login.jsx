import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/Field.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const HOME_FOR = { seeker: "/account", org: "/post", admin: "/admin" };

export default function Login() {
  const { signInAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;      // the page they were trying to open

  const [form, setForm] = useState({ email: "", password: "" });
  const [demoRole, setDemoRole] = useState("seeker");

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault();
    // TEMPORARY: pretend the login worked. Django will check the real email and password.
    signInAs(demoRole);
    navigate(from || HOME_FOR[demoRole], { replace: true });
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

          <div className="field">
            <label htmlFor="li-role">Sign in as (demo only)</label>
            <select className="select" id="li-role" value={demoRole} onChange={(e) => setDemoRole(e.target.value)}>
              <option value="seeker">Seeker</option>
              <option value="org">Organization</option>
              <option value="admin">Admin</option>
            </select>
            <span className="hint">Delete this field when the real login is connected.</span>
          </div>

          <button className="btn btn-primary" type="submit">Sign in</button>
          <p className="note"><Link to="/login">Forgot your password?</Link></p>
          <p className="note">New to Dubem? <Link to="/signup">Create an account</Link></p>
        </form>
      </div>
    </section>
  );
}