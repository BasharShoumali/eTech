import { useEffect, useState } from "react";
import { productsApi } from "../../api/products";
import { Link } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await productsApi.list();
        setItems(data);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      {items.length === 0 ? (
        <p className="opacity-80">No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <article
              key={p.productNumber}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <h3 className="font-medium text-lg mb-1">{p.productName}</h3>
              <div className="text-xs opacity-80 mb-2">
                {p.brand} • #{p.productNumber}
              </div>
              <div className="text-sm">
                Price:{" "}
                <span className="font-semibold">{p.sellingPrice ?? "—"}</span>
              </div>
              <div className="text-sm">
                Stock: <span className="font-semibold">{p.inStock ?? 0}</span>
              </div>
              <div className="mt-3 flex gap-2 text-sm">
                <Link to={`/products/${p.productNumber}`} className="underline">
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
