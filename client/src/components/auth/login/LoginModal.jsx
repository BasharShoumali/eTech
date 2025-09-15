import { useState } from "react";
import "./LoginModal.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function LoginModal({
  open,
  onClose,
  onOpenSignup,
  onOpenForgot,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const closeOnBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: emailOrUsername,
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Login failed (${res.status})`);
      }

      const { user } = await res.json();

      // ✅ Save user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Close modal
      onClose?.();

      // Optional: trigger login event or redirect
      window.location.reload(); // or call onLogin(user) prop
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.message || "Login failed");
    }
  };

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Login dialog"
      onClick={closeOnBackdrop}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Login</h2>
          <button className="iconBtn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email or Username</span>
            <input
              type="text"
              required
              placeholder="you@example.com or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field passwordField">
            <span>Password</span>
            <div className="passwordWrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggleBtn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <button className="primaryBtn" type="submit">
            Sign in
          </button>
        </form>

        <div className="modalFooter">
          <button
            type="button"
            className="secondaryBtn"
            onClick={() => onOpenForgot?.()}
          >
            Forgot password
          </button>
          <button
            type="button"
            className="secondaryBtn"
            onClick={() => onOpenSignup?.()}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
