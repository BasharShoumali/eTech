import { NavLink } from "react-router-dom";

export default function NavLinkItem({ to, label, onNavigate }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `link ${isActive ? "is-active" : ""}`}
        onClick={onNavigate}
      >
        {label}
      </NavLink>
    </li>
  );
}
