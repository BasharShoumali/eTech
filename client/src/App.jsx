import React from "react";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import UpdateProfile from "./pages/updateProfile/UpdateProfile";
import Home from "./pages/home/Home";
import AdminsPage from "./pages/admin/AdminsPage";
import PaymentMethodsPage from "./pages/paymentMethonds/PaymentMethodsPage";
import ProductsPage from "./pages/productsPage/ProductsPage";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/home" element={<AdminsPage />} />
          <Route path="/account/update" element={<UpdateProfile />} />
          <Route
            path="/account/payment-methods"
            element={<PaymentMethodsPage />}
          />
          <Route path="/products-page" element={<ProductsPage />} />
        </Routes>
      </main>
    </>
  );
}
