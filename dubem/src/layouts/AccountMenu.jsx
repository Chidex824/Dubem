import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { MENUS } from "./menus.js";

export default function AccountMenu({ user, role, onSignOut }) {
  const menu = MENUS[role];
  return (
    <>
      <div className="menu-head">
        <b>{user.name}</b>
        <span>{user.email}</span>
        <span className={`pill pill-${menu.badge[0]}`}>{menu.badge[1]}</span>
      </div>

      {menu.items.map(([to, icon, label]) => (
        <Link className="mi" to={to} key={label}><Icon name={icon} />{label}</Link>
      ))}

      <hr />
      <Link className="mi" to="/" onClick={onSignOut}><Icon name="logout" />Sign out</Link>
    </>
  );
}