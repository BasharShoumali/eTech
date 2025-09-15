import React from "react";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import UpdateProfile from "./pages/updateProfile/UpdateProfile";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/account/update" element={<UpdateProfile />} />
        </Routes>
      </main>
    </>
  );
}
