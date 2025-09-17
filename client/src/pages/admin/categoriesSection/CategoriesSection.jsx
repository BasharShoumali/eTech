import { useEffect, useMemo, useState } from "react";
import "./CategoriesSection.css";
import SearchBar from "../components/SearchBar";

export default function CategoriesSection({ API }) {
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [query, setQuery] = useState("");

  const fetchCategories = async () => {
    setState({ loading: true, error: "" });
    try {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
      setState({ loading: false, error: "" });
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [API]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) =>
      (c.categoryName || "").toLowerCase().includes(q)
    );
  }, [categories, query]);

  const updateCategory = async (id, newName) => {
    try {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: newName }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchCategories();
    } catch (e) {
      alert("Error updating category name.");
      console.log(e);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchCategories();
    } catch (e) {
      alert("Error deleting category.");
      console.log(e);
    }
  };

  const changeImage = async (id, file) => {
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
        <h3>Categories</h3>
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
              {filtered.map((cat) => (
                <tr key={cat.categoryNumber}>
                  <td>{cat.categoryNumber}</td>
                  <td>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" className="thumb" />
                    ) : (
                      <span className="muted">No image</span>
                    )}
                  </td>
                  <td>
                    <input
                      className="inlineInput"
                      defaultValue={cat.categoryName}
                      onBlur={(e) =>
                        e.target.value !== cat.categoryName &&
                        updateCategory(cat.categoryNumber, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        changeImage(cat.categoryNumber, e.target.files?.[0])
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="ghostBtn danger"
                      onClick={() => deleteCategory(cat.categoryNumber)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
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
    </section>
  );
}
