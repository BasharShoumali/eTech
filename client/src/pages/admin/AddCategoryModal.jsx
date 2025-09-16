import { useEffect, useState } from "react";
import "./AdminsPage.css";

export default function AddCategoryModal({ API, onClose, onCreated }) {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close when clicking the backdrop (but not the card)
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!categoryName.trim()) return setMsg("Category name is required");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: categoryName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Create failed (${res.status})`);
      }
      onCreated?.();
      onClose?.();
    } catch (e) {
      setMsg(e.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="New Category"
      onClick={handleBackdrop}
    >
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">New Category</h2>
          <button
            type="button"
            className="iconBtn"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form className="form" onSubmit={submit} autoComplete="off">
          <label className="field">
            Category Name
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
            />
          </label>

          <div className="modalActions">
            <button
              type="button"
              className="ghostBtn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="accentBtn" disabled={loading}>
              {loading ? "Saving…" : "Create"}
            </button>
          </div>

          {msg && <p className="formMsg">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
