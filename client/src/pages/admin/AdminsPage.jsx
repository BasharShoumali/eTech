import { useState } from "react";
import "./AdminsPage.css";
import AddProductModal from "./AddProductModal.jsx";
import AddCategoryModal from "./AddCategoryModal.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminPage() {
  const [showProduct, setShowProduct] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [toast, setToast] = useState("");

  const handleCreated = (msg = "Saved!") => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <h1>Admin</h1>
        <div className="adminActions">
          <button className="accentBtn" onClick={() => setShowCategory(true)}>
            New Category
          </button>
          <button className="accentBtn" onClick={() => setShowProduct(true)}>
            New Product
          </button>
        </div>
      </header>

      {toast && <p className="toast">{toast}</p>}

      {/* Your admin content here (tables, stats, etc.) */}

      {showProduct && (
        <AddProductModal
          API={API}
          onClose={() => setShowProduct(false)}
          onCreated={() => handleCreated("Product created")}
        />
      )}

      {showCategory && (
        <AddCategoryModal
          API={API}
          onClose={() => setShowCategory(false)}
          onCreated={() => handleCreated("Category created")}
        />
      )}
    </div>
  );
}
