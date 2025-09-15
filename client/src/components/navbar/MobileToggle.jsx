export default function MobileToggle({ open, onToggle }) {
  return (
    <button
      className="toggle show-on-mobile"
      aria-label="Menu"
      aria-expanded={open}
      aria-controls="mobile-menu"
      onClick={onToggle}
    >
      {open ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 12l6.3-7.71 1.41 1.42z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
        </svg>
      )}
    </button>
  );
}
