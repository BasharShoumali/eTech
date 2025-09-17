import { useEffect, useState } from "react";
import "../AdminsPage.css";
import "./AddCategoryModal.css";
export default function AddCategoryModal({ API, onClose, onCreated }) {
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState(null); // File | null
  const [fileName, setFileName] = useState(""); // UI label
  const [previewUrl, setPreviewUrl] = useState(null);
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

  // Clean up preview URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke previous
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setImage(file);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));

    // allow re-selecting same file later
    e.target.value = "";
  };

  const removeImage = () => {
    setImage(null);
    setFileName("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    const name = categoryName.trim();
    if (!name) return setMsg("Category name is required");

    setLoading(true);
    try {
      // Step 1: Create category
      const res = await fetch(`${API}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: name }),
      });

      if (!res.ok) {
        const err = (await safeJson(res)) || {};
        throw new Error(err.error || `Create failed (${res.status})`);
      }

      const category = await res.json();
      const categoryId = category.categoryNumber;

      // Step 2: Upload image if provided
      if (image && categoryId) {
        const fd = new FormData();
        fd.append("image", image);
        fd.append("categoryName", name); // used by server for folder naming

        const imgRes = await fetch(
          `${API}/api/categories/${categoryId}/image`,
          {
            method: "POST",
            body: fd, // don't set Content-Type manually
          }
        );

        if (!imgRes.ok) {
          const err = (await safeJson(imgRes)) || {};
          throw new Error(
            err.error || `Image upload failed (${imgRes.status})`
          );
        }
      }

      onCreated?.();
      onClose?.();
    } catch (e2) {
      setMsg(e2.message || "Save failed");
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
              disabled={loading}
            />
          </label>

          <label className="field">
            <div className="fieldRowBetween">
              <span>Category Image</span>
              {fileName && <small className="muted">{fileName}</small>}
            </div>

            {/* Styled upload button + hidden input */}
            <div className="fileUpload">
              <label className={`uploadBtn${loading ? " disabled" : ""}`}>
                {image ? "Replace Image" : "Choose Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={onSelectImage}
                  disabled={loading}
                  hidden
                />
              </label>

              {image && (
                <button
                  type="button"
                  className="ghostBtn danger small"
                  onClick={removeImage}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>

            {previewUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: 200,
                    borderRadius: 8,
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
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
