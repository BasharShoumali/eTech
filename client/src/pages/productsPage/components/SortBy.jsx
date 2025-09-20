// src/components/products/SortBy.jsx
export default function SortBy({ value, onChange }) {
  return (
    <div className="sort-by">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sort-select"
      >
        <option value="newest">Sort: Newest</option>
        <option value="priceAsc">Price: Low → High</option>
        <option value="priceDesc">Price: High → Low</option>
        <option value="stockDesc">Stock: High → Low</option>
      </select>
    </div>
  );
}
