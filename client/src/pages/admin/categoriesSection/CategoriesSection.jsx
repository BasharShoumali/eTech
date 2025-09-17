import { useEffect, useMemo, useState } from "react";
import "./CategoriesSection.css";
import SearchBar from "../components/searchBar/SearchBar";

export default function CategoriesSection({ API }) {
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const isAbsoluteUrl = (url) =>
    typeof url === "string" &&
    (/^https?:\/\//i.test(url) || url.startsWith("/"));

  const getImageUrl = (cat) => {
    const raw = cat?.imageUrl || "";
    if (!raw) return "";
    return isAbsoluteUrl(raw) ? `${API}${raw}` : `${API}/assets/imgs/${raw}`;
  };

  const fetchCategories = async () => {
    setState({ loading: true, error: "" });
    try {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = await res.json();

      const sorted = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              (a.categoryNumber ?? 0) - (b.categoryNumber ?? 0) ||
              String(a.categoryName || "").localeCompare(
                String(b.categoryName || "")
              )
          )
        : [];

      setCategories(sorted);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message || "Failed" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [API]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? categories.filter((c) =>
          (c.categoryName || "").toLowerCase().includes(q)
        )
      : categories;
  }, [categories, query]);

  const updateCategory = async (id, newName) => {
    if (!newName.trim()) return;
    const prev = categories;
    setCategories((cs) =>
      cs.map((c) =>
        c.categoryNumber === id ? { ...c, categoryName: newName } : c
      )
    );
    try {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: newName }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (e) {
      setCategories(prev);
      alert("Error updating category name.");
      console.log(e);
    }
  };

  const deleteCategory = async (id) => {
    const prev = categories;
    setCategories((cs) => cs.filter((c) => c.categoryNumber !== id));
    try {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      setCategories(prev);
      alert("Error deleting category.");
      console.log(e);
    }
  };

  const changeImage = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API}/api/categories/${id}/image`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchCategories();
    } catch (e) {
      console.log(e);
      alert("Error uploading image.");
    }
  };

  return (
    <section className="card categoriesSection">
      <div className="cardHead">
        <h2>Categories</h2>
        <small className="muted">
          {filtered.length}/{categories.length} shown
        </small>
      </div>

      <div style={{ marginBottom: 10 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search categories…"
          disabled={state.loading}
        />
      </div>

      {state.loading && <p className="muted">Loading…</p>}
      {state.error && <p className="formMsg danger">Error: {state.error}</p>}

      {!state.loading && !state.error && (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Change Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => {
                const imageSrc = getImageUrl(cat);
                return (
                  <tr key={cat.categoryNumber}>
                    <td>{cat.categoryNumber}</td>
                    <td>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={cat.categoryName || ""}
                          className="thumb"
                          onError={(e) => {
                            console.warn("Image failed to load:", imageSrc);
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="muted">No image</span>
                      )}
                    </td>
                    <td>
                      <input
                        className="inlineInput"
                        defaultValue={cat.categoryName}
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          if (val && val !== cat.categoryName)
                            updateCategory(cat.categoryNumber, val);
                          else e.target.value = cat.categoryName;
                        }}
                      />
                    </td>
                    <td>
                      <label className="uploadBtn small">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) =>
                            changeImage(cat.categoryNumber, e.target.files?.[0])
                          }
                        />
                      </label>
                    </td>
                    <td>
                      <button
                        className="ghostBtn danger"
                        onClick={() => setConfirmDelete(cat)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted center">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmDelete(null)}
        >
          <div className="modalCard small" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <b>{confirmDelete.categoryName}</b>?
            </p>
            <div className="modalActions">
              <button
                className="ghostBtn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="accentBtn danger"
                onClick={() => {
                  deleteCategory(confirmDelete.categoryNumber);
                  setConfirmDelete(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
