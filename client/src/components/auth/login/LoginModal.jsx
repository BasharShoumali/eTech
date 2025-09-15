import { useState } from "react";
import "./LoginModal.css";

export default function LoginModal({
  open,
  onClose,
  onOpenSignup,
  onOpenForgot,
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const closeOnBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };
  const onKeyDown = (e) => {
    if (e.key === "Escape") onClose?.();
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

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>Email</span>
            <input type="email" required placeholder="you@example.com" />
          </label>

          <label className="field passwordField">
            <span>Password</span>
            <div className="passwordWrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
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
