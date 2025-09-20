import ProductCard from "./ProductCard";

export default function ProductsList({
  products,
  imgSrc,
  money,
  onAddToCart,
  onAddToWishlist,
}) {
  if (!products.length) {
    return <div className="text-sm opacity-70">No products found</div>;
  }

  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard
          key={p.productNumber}
          product={p}
          imgSrc={imgSrc}
          money={money}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}
