import { useEffect, useMemo, useState } from "react";
import "./ProductsPage.css";
import CircleCategorySlider from "./components/CircleCategorySlider";
import ProductsList from "./components/ProductsList";
import SearchBar from "../admin/components/searchBar/SearchBar";
import SortBy from "./components/SortBy";

export default function ProductsPage({ API: APIProp }) {
  const API =
    APIProp || import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest"); // <-- Sorting state added

  // ===== Fetch products & categories separately =====
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API}/api/products/full`),
          fetch(`${API}/api/categories`),
        ]);

        if (!prodRes.ok || !catRes.ok) throw new Error("Failed to load data");

        const [productsData, categoriesData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
        ]);

        if (alive) {
          setProducts(Array.isArray(productsData) ? productsData : []);

          const sortedCats = Array.isArray(categoriesData)
            ? [...categoriesData].sort(
                (a, b) =>
                  (a.categoryNumber ?? 0) - (b.categoryNumber ?? 0) ||
                  String(a.categoryName || "").localeCompare(
                    String(b.categoryName || "")
                  )
              )
            : [];
          setCategories(sortedCats);
        }
      } catch (e) {
        if (alive) setError(e.message || "Failed to load data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [API]);

  // ===== Filtering & Sorting =====
  const visible = useMemo(() => {
    let out = products;

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (p) =>
          (p.productName || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category) {
      out = out.filter((p) => String(p.categoryNumber) === String(category));
    }

    // Sorting
    switch (sort) {
      case "priceAsc":
        out = [...out].sort(
          (a, b) => (a.sellingPrice ?? 0) - (b.sellingPrice ?? 0)
        );
        break;
      case "priceDesc":
        out = [...out].sort(
          (a, b) => (b.sellingPrice ?? 0) - (a.sellingPrice ?? 0)
        );
        break;
      case "stockDesc":
        out = [...out].sort((a, b) => (b.inStock ?? 0) - (a.inStock ?? 0));
        break;
      default:
        out = [...out].sort(
          (a, b) => (b.productNumber ?? 0) - (a.productNumber ?? 0)
        );
    }

    return out;
  }, [products, search, category, sort]);

  // ===== Handlers =====
  const handleAddToCart = (p) => alert(`Added ${p.productName} to cart`);
  const handleAddToWishlist = (p) =>
    alert(`Added ${p.productName} to wishlist`);

  // ===== Helpers =====
  const money = (n) => {
    const num = Number(n);
    return !Number.isNaN(num)
      ? num.toLocaleString(undefined, { style: "currency", currency: "ILS" })
      : "—";
  };

  const imgSrc = (p) =>
    p?.image
      ? p.image.startsWith("http")
        ? p.image
        : `${API}${p.image}`
      : "/assets/placeholder.png";

  const getCategoryImg = (cat) => {
    const raw = cat?.imageUrl || "";
    if (!raw) return "/assets/placeholder.png";
    return raw.startsWith("http") || raw.startsWith("/")
      ? `${API}${raw}`
      : `${API}/assets/imgs/${raw}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#cfe9e4]">
      {/* Category Slider */}
      <CircleCategorySlider
        categories={categories.map((c) => ({
          id: String(c.categoryNumber),
          name: c.categoryName,
          image: getCategoryImg(c),
        }))}
        selectedCategory={category}
        onSelect={setCategory}
      />

      {/* Search + Sort Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 search-sort-row">
        <SearchBar value={search} onChange={setSearch} />
        <SortBy value={sort} onChange={setSort} />
      </div>

      {/* Product List */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {loading && <div className="text-sm opacity-80">Loading products…</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}
        {!loading && !error && (
          <>
            <div className="mb-3 text-sm opacity-70">
              {visible.length} results
            </div>
            <ProductsList
              products={visible}
              imgSrc={imgSrc}
              money={money}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </>
        )}
      </main>
    </div>
  );
}
