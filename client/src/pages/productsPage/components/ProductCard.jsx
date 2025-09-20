export default function ProductCard({
  product,
  imgSrc,
  money,
  onAddToCart,
  onAddToWishlist,
}) {
  // Determine stock status
  const stockStatus =
    Number(product.inStock) <= 0
      ? { text: "Out of Stock", className: "stock-out" }
      : Number(product.inStock) < 10
      ? { text: "Low Stock", className: "stock-low" }
      : { text: "In Stock", className: "stock-in" };

  return (
    <article className="product-card thin-card">
      <div className="image-container">
        <img
          src={imgSrc(product)}
          alt={product.productName || "product image"}
          onError={(e) => (e.currentTarget.src = "/assets/placeholder.png")}
        />
        <span className={`stock-badge ${stockStatus.className}`}>
          {stockStatus.text}
        </span>
      </div>

      <div className="card-content">
        <div className="product-name">{product.productName}</div>
        <div className="product-meta">{product.brand || "—"}</div>
        <div className="price">{money(product.sellingPrice)}</div>
      </div>

      <div className="card-actions">
        <button onClick={() => onAddToCart(product)} className="btn btn-cart">
          Add to Cart
        </button>
        <button
          onClick={() => onAddToWishlist(product)}
          className="btn btn-wishlist"
        >
          ♥ Wishlist
        </button>
      </div>
    </article>
  );
}
