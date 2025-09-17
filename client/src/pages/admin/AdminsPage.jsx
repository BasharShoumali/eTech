// src/pages/admin/AdminsPage.jsx
import { useMemo, useState } from "react";
import "./AdminsPage.css";

import AddProductModal from "./addProduct/AddProductModal.jsx";
import AddCategoryModal from "./addCategory/AddCategoryModal.jsx";

import UsersSection from "./usersSection/UsersSection.jsx";
import CategoriesSection from "./categoriesSection/CategoriesSection.jsx";
import ProductsSection from "./productsSection/ProductsSection.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function AdminPage({ currentUser }) {
  const [showProduct, setShowProduct] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [toast, setToast] = useState("");

  // Determine the current user from props or fallback to localStorage
  const me = useMemo(() => {
    if (currentUser) return currentUser;
    try {
      return JSON.parse(localStorage.getItem("authUser") || "null");
    } catch {
      return null;
    }
  }, [currentUser]);

  const handleCreated = (msg = "Saved!") => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <h1 className="adminTitle">Welcome, Boss</h1>
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

      {/* Main Admin Sections */}
      <UsersSection API={API} currentUser={me} />
      <CategoriesSection API={API} />
      <ProductsSection API={API} />

      {/* Popups */}
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
