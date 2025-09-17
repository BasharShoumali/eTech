// src/components/productModal/ProductModal.jsx
import { useEffect, useState } from "react";
import "./ProductModal.css";

export default function ProductModal({ productNumber, onClose, API }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [product, setProduct] = useState(null); // server copy
  const [form, setForm] = useState(null); // editable copy

  const [categories, setCategories] = useState([]);
  const [descs, setDescs] = useState([]);
  const [images, setImages] = useState([]);
  const [newDesc, setNewDesc] = useState({ title: "", text: "" });
  const [files, setFiles] = useState([]); // File[]
  const [filePreviews, setFilePreviews] = useState([]); // [{name, url}]

  // Fetch product + categories + descriptions + images
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const [prodRes, catRes, descRes, imgRes] = await Promise.all([
          fetch(`${API}/api/products/${productNumber}`),
          fetch(`${API}/api/categories`),
          fetch(`${API}/api/descriptions/by-product/${productNumber}`), // ✅ canonical path
          fetch(`${API}/api/products/${productNumber}/images`), // ✅ images from product_images
        ]);

        if (!prodRes.ok) throw new Error(`Product ${prodRes.status}`);
        if (!catRes.ok) throw new Error(`Categories ${catRes.status}`);
        if (!descRes.ok) throw new Error(`Descriptions ${descRes.status}`);
        if (!imgRes.ok) throw new Error(`Images ${imgRes.status}`);

        const [prodData, catsData, descData, imgData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
          descRes.json(),
          imgRes.json(),
        ]);

        if (!alive) return;

        setProduct(prodData);
        // make a shallow editable copy for the form
        setForm({
          productName: prodData.productName || "",
          barcode: prodData.barcode || "",
          brand: prodData.brand || "",
          categoryNumber: prodData.categoryNumber ?? "",
          buyingPrice:
            prodData.buyingPrice != null ? String(prodData.buyingPrice) : "",
          sellingPrice:
            prodData.sellingPrice != null ? String(prodData.sellingPrice) : "",
          inStock: prodData.inStock != null ? String(prodData.inStock) : "",
        });

        setCategories(Array.isArray(catsData) ? catsData : []);
        setDescs(Array.isArray(descData) ? descData : []);
        setImages(Array.isArray(imgData) ? imgData : []);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load");
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [API, productNumber]);

  // --------- Form handlers ----------
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const saveProduct = async () => {
    if (!form) return;
    try {
      setErr("");
      const payload = {
        productName: form.productName.trim(),
        barcode: form.barcode.trim() || null,
        brand: form.brand.trim() || null,
        categoryNumber: form.categoryNumber
          ? Number(form.categoryNumber)
          : null,
        buyingPrice: form.buyingPrice !== "" ? Number(form.buyingPrice) : null,
        sellingPrice:
          form.sellingPrice !== "" ? Number(form.sellingPrice) : null,
        inStock: form.inStock !== "" ? Number(form.inStock) : 0,
      };
      const res = await fetch(`${API}/api/products/${productNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Save failed (${res.status})`);
      }
      const saved = await res.json();
      setProduct(saved);
      // sync the form to what server accepted
      setForm({
        productName: saved.productName || "",
        barcode: saved.barcode || "",
        brand: saved.brand || "",
        categoryNumber: saved.categoryNumber ?? "",
        buyingPrice: saved.buyingPrice != null ? String(saved.buyingPrice) : "",
        sellingPrice:
          saved.sellingPrice != null ? String(saved.sellingPrice) : "",
        inStock: saved.inStock != null ? String(saved.inStock) : "",
      });
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  };

  // --------- Descriptions ----------
  const updateDesc = async (id, field, value) => {
    try {
      const res = await fetch(`${API}/api/descriptions/${id}`, {
        method: "PUT", // ✅ router expects PUT (not PATCH)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(`(${res.status})`);
      const updated = await res.json();
      setDescs((ds) => ds.map((d) => (d.descriptionID === id ? updated : d)));
    } catch (e) {
      setErr(e.message || "Failed to update description");
    }
  };

  const deleteDesc = async (id) => {
    try {
      const res = await fetch(`${API}/api/descriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`(${res.status})`);
      setDescs((ds) => ds.filter((d) => d.descriptionID !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete description");
    }
  };

  const addDescription = async () => {
    const title = newDesc.title.trim();
    const text = newDesc.text.trim();
    if (!title && !text) return;
    try {
      const res = await fetch(`${API}/api/descriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productNumber,
          descriptions: [{ title, text }],
        }),
      });
      if (!res.ok) throw new Error(`(${res.status})`);
      // reload list
      const fresh = await fetch(
        `${API}/api/descriptions/by-product/${productNumber}`
      ).then((r) => r.json());
      setDescs(Array.isArray(fresh) ? fresh : []);
      setNewDesc({ title: "", text: "" });
    } catch (e) {
      setErr(e.message || "Failed to add description");
    }
  };

  // --------- Images ----------
  const onPickFiles = (e) => {
    const filesArray = Array.from(e.target.files || []);
    setFiles(filesArray);

    // Generate preview URLs
    const previews = filesArray.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setFilePreviews(previews);

    // Clear file input value so same file can be selected again
    e.target.value = "";
  };

  // Revoke object URLs when previews change or unmount (avoid memory leaks)
  useEffect(() => {
    return () => {
      filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [filePreviews]);

  const uploadImages = async () => {
    if (!files.length) return;
    const body = new FormData();
    files.forEach((f) => body.append("images", f));
    // pass categoryName if available (server will bucket nicely)
    const catName =
      categories.find(
        (c) => Number(c.categoryNumber) === Number(form?.categoryNumber)
      )?.categoryName || "";
    if (catName) body.append("categoryName", catName);

    try {
      const res = await fetch(`${API}/api/products/${productNumber}/images`, {
        method: "POST",
        body,
      });
      if (!res.ok) throw new Error(`(${res.status})`);
      // refresh images
      const fresh = await fetch(
        `${API}/api/products/${productNumber}/images`
      ).then((r) => r.json());
      setImages(Array.isArray(fresh) ? fresh : []);
      setFiles([]);
      // cleanup previews
      filePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      setFilePreviews([]);
    } catch (e) {
      setErr(e.message || "Failed to upload images");
    }
  };

  const deleteImage = async (imageId) => {
    try {
      const res = await fetch(`${API}/api/product-images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`(${res.status})`);
      setImages((imgs) => imgs.filter((im) => im.id !== imageId));
    } catch (e) {
      setErr(e.message || "Failed to delete image");
    }
  };

  // --------- Render ----------
  return (
    <div
      className="modalOverlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Edit product"
    >
      <div className="modalCard wide">
        <header className="modalHead">
          <h3 className="modalTitle">
            {form?.productName || product?.productName || "Edit Product"}
          </h3>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        {loading && <p className="muted">Loading…</p>}
        {err && <p className="formMsg danger">Error: {err}</p>}

        {!loading && form && (
          <div className="form">
            {/* Basic fields */}
            <div className="twoCol">
              <label className="field">
                Name
                <input
                  name="productName"
                  value={form.productName}
                  onChange={onChange}
                />
              </label>
              <label className="field">
                Barcode
                <input
                  name="barcode"
                  value={form.barcode}
                  onChange={onChange}
                />
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

            <div className="modalActions" style={{ marginTop: 4 }}>
              <button className="ghostBtn" onClick={onClose}>
                Close
              </button>
              <button className="accentBtn" onClick={saveProduct}>
                Save
              </button>
            </div>

            {/* Descriptions */}
            <div className="divider" />
            <h4>Descriptions</h4>
            <div className="descGrid">
              {descs.map((d) => (
                <div key={d.descriptionID} className="descRow">
                  <input
                    placeholder="Title"
                    defaultValue={d.title || ""}
                    onBlur={(e) =>
                      e.target.value !== (d.title || "") &&
                      updateDesc(d.descriptionID, "title", e.target.value)
                    }
                  />
                  <textarea
                    placeholder="Text"
                    defaultValue={d.text || ""}
                    rows={2}
                    onBlur={(e) =>
                      e.target.value !== (d.text || "") &&
                      updateDesc(d.descriptionID, "text", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="ghostBtn danger"
                    onClick={() => deleteDesc(d.descriptionID)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="twoCol" style={{ marginTop: 8 }}>
              <label className="field">
                New description title
                <input
                  value={newDesc.title}
                  onChange={(e) =>
                    setNewDesc((x) => ({ ...x, title: e.target.value }))
                  }
                />
              </label>
              <label className="field">
                New description text
                <input
                  value={newDesc.text}
                  onChange={(e) =>
                    setNewDesc((x) => ({ ...x, text: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="modalActions">
              <button
                className="ghostBtn"
                onClick={() => setNewDesc({ title: "", text: "" })}
              >
                Clear
              </button>
              <button className="accentBtn" onClick={addDescription}>
                Add Description
              </button>
            </div>

            {/* Images */}
            <div className="divider" />
            <h4>Images</h4>

            {/* Existing images (from server) */}
            <div className="imagePreviewGrid">
              {images.map((im) => {
                // controller returns: [{ id, file_name, url }, ...]
                const src =
                  im.url?.startsWith("http") || im.url?.startsWith("/")
                    ? `${API}${im.url}`
                    : `${API}/assets/imgs/${im.url || im.file_name}`;
                return (
                  <div key={im.id} className="previewItem">
                    <img
                      src={src}
                      alt="product"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      type="button"
                      className="ghostBtn danger small"
                      onClick={() => deleteImage(im.id)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              {images.length === 0 && (
                <p className="muted" style={{ margin: 0 }}>
                  No images
                </p>
              )}
            </div>

            {/* New selection previews (client-side, before upload) */}
            {filePreviews.length > 0 && (
              <>
                <div className="divider" />
                <h4>New Uploads (Preview)</h4>
                <div className="imagePreviewGrid">
                  {filePreviews.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="previewItem">
                      <img src={f.url} alt={f.name} />
                      <small className="muted">{f.name}</small>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="fileUpload" style={{ marginTop: 8 }}>
              <label className="uploadBtn">
                Upload Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={onPickFiles}
                />
              </label>
              {files.length > 0 && (
                <>
                  <small className="muted">{files.length} selected</small>
                  <button
                    className="accentBtn"
                    type="button"
                    onClick={uploadImages}
                  >
                    Save Uploads
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
