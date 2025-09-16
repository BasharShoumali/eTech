import { useEffect, useState } from "react";
import "./UpdateProfile.css";
import ResetPasswordPopup from "./ResetPasswordPopup";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Return a numeric ID string (userNumber/id/_id/userID) or null */
const getNumericId = (u) => {
  const candidates = [u?.userNumber, u?.id, u?._id, u?.userID];
  for (const c of candidates) {
    if (c == null) continue;
    const s = String(c);
    if (/^\d+$/.test(s)) return s; // only digits allowed
  }
  return null;
};

export default function UpdateProfile() {
  const savedUser = localStorage.getItem("user");
  const [user, setUser] = useState(() =>
    savedUser ? JSON.parse(savedUser) : null
  );

  const uid = getNumericId(user);

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
    if (!uid) {
      setMessage("User numeric ID missing — please re-login.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/users/${uid}`, {
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
    if (!uid) {
      setMessage("User numeric ID missing — please re-login.");
      return;
    }
    try {
      const res = await fetch(`${API}/api/users/${uid}`, {
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
          { label: "First Name", name: "firstName", type: "text" },
          { label: "Last Name", name: "lastName", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone Number", name: "phoneNumber", type: "tel" },
          { label: "Address", name: "address", type: "text" },
        ].map(({ label, name, type }) => (
          <div className="fieldRow" key={name}>
            <label className="fieldLabel" htmlFor={name}>
              {label}
            </label>

            <div className="inputGroup">
              <input
                id={name}
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="miniBtn"
                onClick={() => updateField(name)}
              >
                Update
              </button>
            </div>
          </div>
        ))}

        <div className="actionsRow">
          <button
            className="primaryBtn"
            type="button"
            onClick={handleUpdateAll}
          >
            Update All
          </button>

          <button
            className="secondaryBtn"
            type="button"
            onClick={() => setShowPasswordPopup(true)}
          >
            Reset Password
          </button>
        </div>

        {message && <p className="updateMessage">{message}</p>}
      </form>

      {showPasswordPopup && (
        <ResetPasswordPopup
          userID={uid} // numeric-only id
          onClose={() => setShowPasswordPopup(false)}
        />
      )}
    </div>
  );
}
