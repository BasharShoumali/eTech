// ForgotPasswordModal.jsx
import { useState } from "react";
import "./ForgotPasswordModal.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ForgotPasswordModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [userID, setUserID] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    try {
      const res = await fetch(`${API}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          phoneNumber: phone.trim(),
          userID: userID.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Forgot Password Error:", err);
      alert(err.message);
    }
  };

  const handleCopy = () => {
    if (result?.password) {
      navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Recover Password</h2>
          <button className="iconBtn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="fieldRow">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="fieldRow">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="fieldRow">
            <span>User ID</span>
            <input
              type="text"
              name="userID"
              required
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              placeholder="123456789"
            />
          </div>

          <button className="primaryBtn" type="submit">
            Recover Password
          </button>
        </form>

        {result && (
          <div className="fieldRow">
            <span>Temporary Password:</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <code style={{ fontSize: "1rem", color: "#7cc7b8" }}>
                {result.password}
              </code>
              <button
                type="button"
                className="secondaryBtn"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
        )}

        {copied && (
          <div className="copyPopup" role="alert">
            Password copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}
