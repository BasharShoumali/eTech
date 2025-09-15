// src/pages/account/UpdateProfile.jsx
import { useEffect, useState } from "react";
import "./UpdateProfile.css";
import ResetPasswordPopup from "./ResetPasswordPopup";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function UpdateProfile() {
  const savedUser = localStorage.getItem("user");
  const [user, setUser] = useState(() =>
    savedUser ? JSON.parse(savedUser) : null
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateField = async (field) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/api/users/${user.userID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: form[field] }),
      });
      if (!res.ok) throw new Error("Failed to update " + field);
      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage(`${field} updated successfully!`);
    } catch (err) {
      console.error(`${field} update failed:`, err);
      setMessage(`Error updating ${field}`);
    }
  };

  const handleUpdateAll = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/api/users/${user.userID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("All fields updated successfully!");
    } catch (err) {
      console.error("Bulk update failed:", err);
      setMessage("Bulk update failed");
    }
  };

  if (!user) return <p>Please log in to update your profile.</p>;

  return (
    <div className="updateProfilePage">
      <h2>Update Profile</h2>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        {[
          { label: "First Name", name: "firstName" },
          { label: "Last Name", name: "lastName" },
          { label: "Email", name: "email" },
          { label: "Phone Number", name: "phoneNumber" },
          { label: "Address", name: "address" },
        ].map(({ label, name }) => (
          <div className="fieldRow" key={name}>
            <label className="field">
              {label}
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
              />
            </label>
            <button
              type="button"
              className="miniBtn"
              onClick={() => updateField(name)}
            >
              Update
            </button>
          </div>
        ))}

        <button className="primaryBtn" type="button" onClick={handleUpdateAll}>
          Update All
        </button>

        <button
          className="secondaryBtn"
          type="button"
          onClick={() => setShowPasswordPopup(true)}
        >
          Reset Password
        </button>

        {message && <p className="updateMessage">{message}</p>}
      </form>

      {showPasswordPopup && (
        <ResetPasswordPopup
          userID={user.userID}
          onClose={() => setShowPasswordPopup(false)}
        />
      )}
    </div>
  );
}
