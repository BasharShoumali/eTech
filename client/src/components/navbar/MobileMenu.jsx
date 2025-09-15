export default function MobileMenu({ open, onClose, children }) {
  return (
    <div
      id="mobile-menu"
      className={`menu ${open ? "is-open" : ""}`}
      role="menu"
      aria-label="Mobile navigation"
    >
      <div className="menu__panel" onClick={onClose}>
        {children}
      </div>
    </div>
  );
}
