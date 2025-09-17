import { useEffect, useMemo, useState } from "react";
import "../AdminsPage.css";
import "./AddProductModal.css";

export default function AddProductModal({ API, onClose, onCreated }) {
  const [form, setForm] = useState({
    productName: "",
    barcode: "",
    brand: "",
    categoryNumber: "",
    buyingPrice: "",
    sellingPrice: "",
    inStock: "",
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // File[]
  const [descs, setDescs] = useState([{ title: "", text: "" }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const MAX_IMAGES = 8; // keep in sync with backend multer limit

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        setCategories([]);
      }
    })();
  }, [API]);

  // Previews for images
  const previews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );
  useEffect(
    () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
    [previews]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Append images instead of replacing; dedupe; respect MAX_IMAGES
  const onSelectImages = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    setImages((prev) => {
      const merged = [...prev, ...picked];

      // dedupe by name+size+lastModified
      const seen = new Set();
      const unique = [];
      for (const f of merged) {
        const key = `${f.name}__${f.size}__${f.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(f);
        }
      }
      return unique.slice(0, MAX_IMAGES);
    });

    // allow re-selecting the same files later
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDesc = (i, key, value) => {
    setDescs((d) => {
      const copy = [...d];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  };

  const addDescRow = () => setDescs((d) => [...d, { title: "", text: "" }]);
  const removeDescRow = (idx) => setDescs((d) => d.filter((_, i) => i !== idx));

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

    if (!form.productName.trim()) return setMsg("Product name is required");
    if (!form.sellingPrice || Number(form.sellingPrice) < 0)
      return setMsg("Selling price must be >= 0");
    if (form.buyingPrice && Number(form.buyingPrice) < 0)
      return setMsg("Buying price must be >= 0");

    setLoading(true);
    try {
      // 1) Create product -> get { productNumber }
      const createRes = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName.trim(),
          barcode: form.barcode.trim() || null,
          brand: form.brand.trim() || null,
          categoryNumber: form.categoryNumber
            ? Number(form.categoryNumber)
            : null,
          buyingPrice: form.buyingPrice ? Number(form.buyingPrice) : null,
          sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : null,
          inStock: form.inStock ? Number(form.inStock) : 0,
        }),
      });
      if (!createRes.ok) {
        const err = (await safeJson(createRes)) || {};
        throw new Error(
          err.error || `Product create failed (${createRes.status})`
        );
      }
      const { productNumber } = await createRes.json();
      if (!productNumber)
        throw new Error("Server did not return productNumber");

      // 2) Upload images (optional)
      if (images.length) {
        const fd = new FormData();
        images.forEach((file) => fd.append("images", file)); // MUST match upload.fields({name:'images'})
        const category = categories.find(
          (c) => Number(c.categoryNumber) === Number(form.categoryNumber)
        );
        if (category?.categoryName)
          fd.append("categoryName", category.categoryName);

        const imgRes = await fetch(
          `${API}/api/products/${productNumber}/images`,
          {
            method: "POST",
            body: fd, // don't set Content-Type
          }
        );
        if (!imgRes.ok) {
          const err = (await safeJson(imgRes)) || {};
          throw new Error(
            err.error || `Images upload failed (${imgRes.status})`
          );
        }
      }

      // 3) Create descriptions (optional)
      const cleanDescs = descs
        .map((d) => ({ title: d.title.trim(), text: d.text.trim() }))
        .filter((d) => d.title || d.text);

      if (cleanDescs.length) {
        const dRes = await fetch(`${API}/api/descriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productNumber, descriptions: cleanDescs }),
        });
        if (!dRes.ok) {
          const err = (await safeJson(dRes)) || {};
          throw new Error(
            err.error || `Descriptions create failed (${dRes.status})`
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
      aria-label="New Product"
      onClick={handleBackdrop}
    >
      <div className="modalCard wide">
        <header className="modalHead">
          <h2 className="modalTitle">New Product</h2>
          <button
            className="iconBtn"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form className="form" onSubmit={submit}>
          <div className="twoCol">
            <label className="field">
              Product Name
              <input
                name="productName"
                value={form.productName}
                onChange={onChange}
                required
              />
            </label>
            <label className="field">
              Barcode
              <input name="barcode" value={form.barcode} onChange={onChange} />
            </label>
          </div>

          <div className="twoCol">
            <label className="field">
              Brand
              <input name="brand" value={form.brand} onChange={onChange} />
            </label>
            <label className="field">
              Category
              <select
                name="categoryNumber"
                value={form.categoryNumber}
                onChange={onChange}
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.categoryNumber} value={c.categoryNumber}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="threeCol">
            <label className="field">
              Buying Price
              <input
                name="buyingPrice"
                type="number"
                step="0.01"
                value={form.buyingPrice}
                onChange={onChange}
              />
            </label>
            <label className="field">
              Selling Price
              <input
                name="sellingPrice"
                type="number"
                step="0.01"
                value={form.sellingPrice}
                onChange={onChange}
                required
              />
            </label>
            <label className="field">
              In Stock
              <input
                name="inStock"
                type="number"
                value={form.inStock}
                onChange={onChange}
              />
            </label>
          </div>

          {/* Images */}
          <div className="field">
            <div className="fieldRowBetween">
              <span>Images</span>
              <small className="muted">
                {images.length}/{MAX_IMAGES} selected — You can select multiple
              </small>
            </div>

            {/* Styled upload button + hidden input */}
            <div className="fileUpload">
              <label
                className={`uploadBtn${
                  images.length >= MAX_IMAGES ? " disabled" : ""
                }`}
              >
                {images.length ? "Add More Images" : "Choose Images"}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onSelectImages}
                  disabled={images.length >= MAX_IMAGES}
                  hidden
                />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="imagePreviewGrid">
                {previews.map((src, i) => (
                  <div key={i} className="previewItem">
                    <img src={src} alt={`preview-${i}`} />
                    <button
                      type="button"
                      className="ghostBtn danger small"
                      onClick={() => removeImage(i)}
                      style={{ marginTop: 6 }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="field">
            <div className="fieldRowBetween">
              <span>Descriptions</span>
              <button type="button" className="ghostBtn" onClick={addDescRow}>
                + Add row
              </button>
            </div>

            <div className="descGrid">
              {descs.map((d, i) => (
                <div key={i} className="descRow">
                  <input
                    placeholder="Title"
                    value={d.title}
                    onChange={(e) => updateDesc(i, "title", e.target.value)}
                  />
                  <textarea
                    placeholder="Text"
                    rows={2}
                    value={d.text}
                    onChange={(e) => updateDesc(i, "text", e.target.value)}
                  />
                  <button
                    type="button"
                    className="ghostBtn danger"
                    onClick={() => removeDescRow(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

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
