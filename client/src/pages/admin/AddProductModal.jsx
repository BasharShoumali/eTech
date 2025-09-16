import { useEffect, useMemo, useState } from "react";
import "./AdminsPage.css";

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
  const [images, setImages] = useState([]);               // File[] (multiple)
  const [descs, setDescs] = useState([{ title: "", text: "" }]); // dynamic rows
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // load categories for select
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

  const previews = useMemo(
    () => images.map((f) => URL.createObjectURL(f)),
    [images]
  );

  useEffect(() => {
    return () => previews.forEach((u) => URL.revokeObjectURL(u));
  }, [previews]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSelectImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const updateDesc = (i, key, value) => {
    setDescs((d) => {
      const copy = [...d];
      copy[i] = { ...copy[i], [key]: value };
      return copy;
    });
  };

  const addDescRow = () => setDescs((d) => [...d, { title: "", text: "" }]);
  const removeDescRow = (idx) =>
    setDescs((d) => d.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.productName.trim()) return setMsg("Product name is required");
    if (!form.sellingPrice || Number(form.sellingPrice) < 0) return setMsg("Selling price must be >= 0");
    if (form.buyingPrice && Number(form.buyingPrice) < 0) return setMsg("Buying price must be >= 0");

    setLoading(true);
    try {
      // 1) Create product (products)
      const res = await fetch(`${API}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: form.productName.trim(),
          barcode: form.barcode.trim() || null,
          brand: form.brand.trim() || null,
          categoryNumber: form.categoryNumber ? Number(form.categoryNumber) : null,
          buyingPrice: form.buyingPrice ? Number(form.buyingPrice) : null,
          sellingPrice: form.sellingPrice ? Number(form.sellingPrice) : null,
          inStock: form.inStock ? Number(form.inStock) : 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Product create failed (${res.status})`);
      }
      const created = await res.json();
      // Expect backend to return the created product with productNumber
      const productNumber = created?.productNumber ?? created?.product?.productNumber ?? created?.id;
      if (!productNumber) throw new Error("Server did not return productNumber");

      // 2) Upload images (imgs) — multiple -> POST /api/products/:productNumber/images
      if (images.length) {
        const fd = new FormData();
        images.forEach((file, idx) => {
          fd.append("images", file);                  // backend reads req.files('images')
          fd.append("indexes", String(idx + 1));      // optional: imgNumberOfProduct
        });
        const imgRes = await fetch(`${API}/api/products/${productNumber}/images`, {
          method: "POST",
          body: fd,
        });
        if (!imgRes.ok) {
          const err = await imgRes.json().catch(() => ({}));
          throw new Error(err.error || `Images upload failed (${imgRes.status})`);
        }
      }

      // 3) Create descriptions (descriptions) — bulk -> POST /api/products/:productNumber/descriptions
      const cleanDescs = descs
        .map((d) => ({ title: d.title.trim(), text: d.text.trim() }))
        .filter((d) => d.title || d.text);
      if (cleanDescs.length) {
        const dRes = await fetch(`${API}/api/products/${productNumber}/descriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ descriptions: cleanDescs }),
        });
        if (!dRes.ok) {
          const err = await dRes.json().catch(() => ({}));
          throw new Error(err.error || `Descriptions create failed (${dRes.status})`);
        }
      }

      onCreated?.();
      onClose();
    } catch (e) {
      setMsg(e.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard wide">
        <header className="modalHead">
          <h2 className="modalTitle">New Product</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close" disabled={loading}>✕</button>
        </header>

        <form className="form" onSubmit={submit}>
          <div className="twoCol">
            <label className="field">
              Product Name
              <input name="productName" value={form.productName} onChange={onChange} required />
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
              <select name="categoryNumber" value={form.categoryNumber} onChange={onChange}>
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
              <input name="buyingPrice" type="number" step="0.01" value={form.buyingPrice} onChange={onChange} />
            </label>
            <label className="field">
              Selling Price
              <input name="sellingPrice" type="number" step="0.01" value={form.sellingPrice} onChange={onChange} required />
            </label>
            <label className="field">
              In Stock
              <input name="inStock" type="number" value={form.inStock} onChange={onChange} />
            </label>
          </div>

          {/* Images */}
          <div className="field">
            <div className="fieldRowBetween">
              <span>Images</span>
              <small className="muted">You can select multiple</small>
            </div>
            <input type="file" multiple accept="image/*" onChange={onSelectImages} />
            {previews.length > 0 && (
              <div className="imagePreviewGrid">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`preview-${i}`} />
                ))}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="field">
            <div className="fieldRowBetween">
              <span>Descriptions</span>
              <button type="button" className="ghostBtn" onClick={addDescRow}>+ Add row</button>
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
                  <button type="button" className="ghostBtn danger" onClick={() => removeDescRow(i)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modalActions">
            <button type="button" className="ghostBtn" onClick={onClose} disabled={loading}>
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
