import { useState } from "react";
import "./ResetPasswordPopup.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PASSWORD_KEY = "password";

export default function ResetPasswordPopup({ userID, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!userID) return setMessage("Missing user ID. Please re-login.");
    if (password !== confirmPassword)
      return setMessage("Passwords do not match.");
    if (password.length < 8)
      return setMessage("Password must be at least 8 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/${userID}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [PASSWORD_KEY]: password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Password update failed (${res.status})`);
      }

      setMessage("Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error.message || "Password update failed");
    } finally {
      setLoading(false);
    }
  };

  // Hidden username for password managers
  const defaultUsername = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.userName || u.username || u.email || "";
    } catch {
      return "";
    }
  })();

  // Close when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modalOverlay")) {
      onClose();
    }
  };

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Reset Password</h2>
          <button
            className="iconBtn"
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form className="form" onSubmit={handleSubmit} autoComplete="off">
          {/* Hidden username */}
          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue={defaultUsername}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              height: 0,
              width: 0,
              opacity: 0,
            }}
          />

          <label className="field">
            New Password
            <div className="passwordField">
              <input
                type={visible ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {visible ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <label className="field">
            Confirm Password
            <input
              type={visible ? "text" : "password"}
              name="confirm-new-password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button className="resetPrimaryBtn" type="submit" disabled={loading}>
            {loading ? "Updating…" : "Reset Password"}
          </button>
          {message && <p className="updateMessage">{message}</p>}
        </form>
      </div>
    </div>
  );
}
