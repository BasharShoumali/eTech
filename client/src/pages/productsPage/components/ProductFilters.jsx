// src/components/products/ProductFilters.jsx
export default function ProductFilters({
  filters,
  categories,
  brands,
  onChange,
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-3 grid gap-2 md:grid-cols-4">
      <div className="md:col-span-2">
        <input
          className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-white/10 outline-none focus:border-emerald-500"
          placeholder="Search by name or brand…"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <select
        className="px-3 py-2 rounded-xl bg-[#121212] border border-white/10"
        value={filters.category}
        onChange={(e) => onChange({ category: e.target.value })}
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <select
        className="px-3 py-2 rounded-xl bg-[#121212] border border-white/10"
        value={filters.brand}
        onChange={(e) => onChange({ brand: e.target.value })}
      >
        <option value="">All Brands</option>
        {brands.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </select>
      <select
        className="px-3 py-2 rounded-xl bg-[#121212] border border-white/10 md:col-span-4"
        value={filters.sort}
        onChange={(e) => onChange({ sort: e.target.value })}
      >
        <option value="newest">Sort: Newest</option>
        <option value="priceAsc">Sort: Price (Low → High)</option>
        <option value="priceDesc">Sort: Price (High → Low)</option>
        <option value="stockDesc">Sort: Stock (High → Low)</option>
      </select>
    </div>
  );
}
