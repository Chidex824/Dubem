import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Icon from "../components/Icon.jsx";
import AccountMenu from "./AccountMenu.jsx";

const LINKS = [
  ["/opportunities", "Opportunities"],
  ["/jobs", "Jobs"],
  ["/internships", "Internships"],
  ["/fellowships", "Fellowships"],
  ["/for-organizations", "For organizations"],
];

export default function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const [open, setOpen] = useState(null);
  const headerRef = useRef(null);
  const location = useLocation();

  const initials = user ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("") : "";
  const toggle = (which) => setOpen(open === which ? null : which);

  useEffect(() => setOpen(null), [location.pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    const onClick = (e) => headerRef.current && !headerRef.current.contains(e.target) && setOpen(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header className="navwrap" ref={headerRef}>
      <div className="nav">
        <Link className="logo" to="/"><i>D</i>Dubem</Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>

        <div className="nav-actions">
          {role === "guest" && (
            <span className="nav-pair">
              <Link className="btn btn-ghost btn-sm" to="/login">Sign in</Link>
              <Link className="btn btn-primary btn-sm" to="/signup">Create account</Link>
            </span>
          )}

          {role === "org" && (
            <Link className="btn btn-ghost btn-sm" to="/post"><Icon name="plus" small />Post</Link>
          )}

          {user && (
            <div className="acct-wrap">
              <button className="avatar" type="button" aria-haspopup="true"
                      aria-expanded={open === "avatar"} aria-label="Account menu"
                      onClick={() => toggle("avatar")}>
                {initials}
              </button>
              <div className={open === "avatar" ? "menu open" : "menu"}>
                <AccountMenu user={user} role={role} onSignOut={signOut} />
              </div>
            </div>
          )}

          <button className="menu-btn" type="button" aria-label={open === "sheet" ? "Close menu" : "Open menu"}
                  aria-expanded={open === "sheet"} onClick={() => toggle("sheet")}>
            <Icon name={open === "sheet" ? "x" : "menu"} />
          </button>
        </div>
      </div>

      <div className={open === "sheet" ? "msheet open" : "msheet"}>
        <div className="ms-links">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to}>{label}<Icon name="chev" small /></NavLink>
          ))}
        </div>
        <div className="ms-acct">
          {role === "guest" ? (
            <>
              <Link className="btn btn-ghost" to="/login">Sign in</Link>
              <Link className="btn btn-primary" to="/signup">Create account</Link>
            </>
          ) : (
            <AccountMenu user={user} role={role} onSignOut={signOut} />
          )}
        </div>
      </div>
    </header>
  );
}