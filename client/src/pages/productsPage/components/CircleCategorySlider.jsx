import "./CircleCategorySlider.css";

export default function CircleCategorySlider({
  categories,
  selectedCategory,
  onSelect,
}) {
  if (!categories.length) return null;

  return (
    <div className="category-slider">
      <div className="category-slider-inner">
        {/* First column = All btn */}
        <div
          className={`category-item first-col ${
            !selectedCategory ? "active" : ""
          }`}
          onClick={() => onSelect("")}
        >
          <div className="circle-btn">All</div>
        </div>

        {/* Categories */}
        {categories.map((c) => (
          <div
            key={c.id}
            className={`category-item ${
              selectedCategory === String(c.id) ? "active" : ""
            }`}
            onClick={() => onSelect(String(c.id))}
          >
            <img
              src={c.image}
              alt={c.name}
              onError={(e) => (e.currentTarget.src = "/assets/placeholder.png")}
            />
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
