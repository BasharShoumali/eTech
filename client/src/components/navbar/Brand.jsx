import { Link } from "react-router-dom";
import "./navbar.css";

export default function Brand({ to = "/" }) {
  return (
    <Link to={to} className="brand" aria-label="E-Tech Home">
      <img
        src="/assets/logos/E-square-logo.png"
        alt="E-Tech"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/brand/e-tech-icon-square.svg";
        }}
      />
      <span className="brand__name">E-Tech</span>
    </Link>
  );
}
