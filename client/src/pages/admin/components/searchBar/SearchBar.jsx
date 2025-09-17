import { useState, useEffect } from "react";
import "./SearchBar.css";

/**
 * Reusable search input with tiny debounce.
 * Props:
 * - value: string
 * - onChange: (next: string) => void
 * - placeholder?: string
 * - disabled?: boolean
 * - delay?: number (ms) default 200
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  disabled = false,
  delay = 200,
}) {
  const [local, setLocal] = useState(value || "");

  useEffect(() => setLocal(value || ""), [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange?.(local), delay);
    return () => clearTimeout(t);
  }, [local, delay, onChange]);

  const clearInput = () => {
    setLocal("");
    onChange?.("");
  };

  return (
    <div className="searchBar">
      <input
        type="text"
        className="searchInput"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {local && !disabled && (
        <button
          type="button"
          className="clearBtn"
          onClick={clearInput}
          aria-label="Clear"
        >
          ✕
        </button>
      )}
      <span className="searchIcon" aria-hidden>
        🔎
      </span>
    </div>
  );
}
