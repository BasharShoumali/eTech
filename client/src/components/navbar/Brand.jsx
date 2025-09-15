import "./navbar.css";

export default function Brand() {
  return (
    <a href="/" className="brand" aria-label="E-Tech Home">
      <img
        src="/assets/logos/E-square-logo.png"
        alt="E-Tech"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/brand/e-tech-icon-square.svg";
        }}
      />
      <span className="brand__name">E-Tech</span>
    </a>
  );
}
