import { useState } from "react";
import "./ResetPasswordPopup.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ResetPasswordPopup({ userID, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API}/api/users/${userID}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Password reset failed");
      }

      setMessage("Password reset successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Reset Password</h2>
          <button className="iconBtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            New Password
            <div className="passwordField">
              <input
                type={visible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <label className="field">
            Confirm Password
            <input
              type={visible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>

          <button className="primaryBtn" type="submit">
            Reset Password
          </button>
          {message && <p className="updateMessage">{message}</p>}
        </form>
      </div>
    </div>
  );
}
