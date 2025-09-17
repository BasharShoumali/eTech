import { useEffect, useMemo, useState } from "react";
import "./ProductsSection.css";
import SearchBar from "../components/searchBar/SearchBar.jsx";
import ProductModal from "../components/productModal/ProductModal.jsx";

export default function ProductsSection({ API }) {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setState({ loading: true, error: "" });
      try {
        const res = await fetch(`${API}/api/products/full`);
        if (!res.ok) throw new Error(`Load failed (${res.status})`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
        setState({ loading: false, error: "" });
      } catch (e) {
        setState({ loading: false, error: e.message || "Failed" });
      }
    };
    fetchProducts();
  }, [API]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.productNumber - b.productNumber); // ascending
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedProducts;

    return sortedProducts.filter((p) => {
      const name = p.productName?.toLowerCase() || "";
      const brand = p.brand?.toLowerCase() || "";
      const barcode = p.barcode?.toLowerCase() || "";
      const category = p.categoryName?.toLowerCase() || "";
      const categoryNum = String(p.categoryNumber ?? "");
      const id = String(p.productNumber ?? "");

      return (
        name.includes(q) ||
        brand.includes(q) ||
        barcode.includes(q) ||
        category.includes(q) ||
        categoryNum.includes(q) ||
        id.includes(q)
      );
    });
  }, [sortedProducts, query]);

  const getImageUrl = (p) => {
    const url = p.image || "";
    if (!url) return "";
    return url.startsWith("/") ? `${API}${url}` : `${API}/assets/imgs/${url}`;
  };

  return (
    <section className="card productsSection">
      <div className="cardHead">
        <h2>Products</h2>
        <small className="muted">
          {filtered.length}/{products.length} shown
        </small>
      </div>

      <div className="searchRow">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name, brand, or barcode…"
        />
      </div>

      {state.loading && <p className="muted">Loading…</p>}
      {state.error && <p className="formMsg danger">Error: {state.error}</p>}

      {!state.loading && !state.error && (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Barcode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const img = getImageUrl(p);
                return (
                  <tr key={p.productNumber}>
                    <td>{p.productNumber}</td>
                    <td>
                      {img ? (
                        <img
                          src={img}
                          alt={p.productName || ""}
                          className="thumb"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      ) : (
                        <span className="muted">No image</span>
                      )}
                    </td>
                    <td>{p.productName}</td>
                    <td>{p.categoryName || "—"}</td>
                    <td>{p.brand || "—"}</td>
                    <td>{p.barcode}</td>
                    <td>
                      <button
                        className="ghostBtn viewEdit"
                        onClick={() => setSelectedProduct(p.productNumber)}
                      >
                        View & Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="center muted">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          productNumber={selectedProduct}
          API={API}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
}
