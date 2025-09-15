import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productsApi } from "../../api/products";
import { imgsApi } from "../../api/imgs";
import { descriptionsApi } from "../../api/descriptions";

export default function ProductView() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [imgs, setImgs] = useState([]);
  const [descs, setDescs] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const p = await productsApi.get(id);
        const i = await imgsApi.byProduct(id);
        const d = await descriptionsApi.byProduct(id);
        setProduct(p);
        setImgs(i);
        setDescs(d);
      } catch (e) {
        setErr(e.message || "Failed to load product");
      }
    })();
  }, [id]);

  if (err) return <div className="text-red-400">{err}</div>;
  if (!product) return <div>Loading…</div>;

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">{product.productName}</h1>
      <div className="opacity-80 text-sm">
        Brand: {product.brand} • Category #{product.categoryNumber}
      </div>
      <div>
        Price: <strong>{product.sellingPrice}</strong> • Stock:{" "}
        <strong>{product.inStock}</strong>
      </div>

      {imgs.length > 0 && (
        <div className="flex gap-3 mt-2 flex-wrap">
          {imgs.map((im) => (
            <img
              key={im.imgID || im.imgSrc}
              src={im.imgSrc}
              alt=""
              className="w-28 h-28 object-cover rounded-lg border border-zinc-800"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ))}
        </div>
      )}

      {descs.length > 0 && (
        <ul className="list-disc pl-5 mt-2">
          {descs.map((d) => (
            <li key={d.descriptionID}>
              <strong>{d.title}:</strong> {d.text}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
