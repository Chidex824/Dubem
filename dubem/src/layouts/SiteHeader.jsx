import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function SiteHeader() {
  const { user, role, signInAs, signOut } = useAuth();

  return (
    <header>
      <Link to="/">Dubem</Link>

      <nav>
        <NavLink to="/opportunities">Opportunities</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/internships">Internships</NavLink>
        <NavLink to="/fellowships">Fellowships</NavLink>
        <NavLink to="/for-organizations">For organizations</NavLink>
      </nav>

      <div>
        {role === "guest" && (
          <>
            <Link to="/signup">Sign in</Link>
            <Link to="/signup">Create account</Link>
          </>
        )}

        {role === "org" && <Link to="/post">Post</Link>}

        {user && (
          <>
            <span>{user.name}</span>
            <button onClick={signOut}>Sign out</button>
          </>
        )}

        {/* Temporary testing buttons. Delete before launch. */}
        <select value={role} onChange={(e) => signInAs(e.target.value)}>
          <option value="guest">View as visitor</option>
          <option value="seeker">View as seeker</option>
          <option value="org">View as organization</option>
          <option value="admin">View as admin</option>
        </select>
      </div>
    </header>
  );
}