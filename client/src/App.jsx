import React from "react";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import UpdateProfile from "./pages/updateProfile/UpdateProfile";
import Home from "./pages/home/Home";
import AdminsPage from "./pages/admin/AdminsPage";
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/home" element={<AdminsPage />} />
          <Route path="/account/update" element={<UpdateProfile />} />
        </Routes>
      </main>
    </>
  );
}
