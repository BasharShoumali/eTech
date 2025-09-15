import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./SignupModal.css";

// base API
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function SignupModal({ open, onClose, onOpenLogin }) {
  const [dob, setDob] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload = {
      firstName: fd.get("firstName")?.trim(),
      lastName: fd.get("lastName")?.trim(),
      userName: fd.get("userName")?.trim(),
      email: fd.get("email")?.trim(),
      password: fd.get("password"), // plain; server hashes
      confirmPassword: fd.get("confirmPassword"), // optional (client check)
      phoneNumber: fd.get("phoneNumber")?.trim(),
      userID: fd.get("userID")?.trim(),
      dateOfBirth: fd.get("dateOfBirth") || "", // "yyyy-MM-dd"
      address: fd.get("address")?.trim(),
    };

    if (payload.password !== payload.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Signup failed (${res.status})`);
      }

      await res.json(); // <-- removed unused variable; ESLint ok

      // optional: save user locally, then close + go to login
      // localStorage.setItem("user", JSON.stringify(user));
      onClose?.();
      onOpenLogin?.(); // open login after successful signup
    } catch (err) {
      console.error(err);
      alert(err.message || "Signup failed");
    }
  };

  // format Date -> "yyyy-MM-dd" for backend
  const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Create account dialog"
    >
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Create account</h2>
          <button className="iconBtn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="fieldRow">
            <span>First Name</span>
            <input type="text" name="firstName" required placeholder="John" />
          </div>

          <div className="fieldRow">
            <span>Last Name</span>
            <input type="text" name="lastName" required placeholder="Doe" />
          </div>

          <div className="fieldRow">
            <span>Username</span>
            <input
              type="text"
              name="userName"
              required
              placeholder="johndoe123"
            />
          </div>

          <div className="fieldRow">
            <span>Email</span>
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="fieldRow">
            <span>Password</span>
            <div className="passWrap">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
                title={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="fieldRow">
            <span>Confirm Password</span>
            <div className="passWrap">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={6}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eyeBtn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="fieldRow">
            <span>Phone</span>
            <input type="tel" name="phoneNumber" placeholder="+1 234 567 890" />
          </div>

          <div className="fieldRow">
            <span>User ID</span>
            <input type="text" name="userID" placeholder="123456789" />
          </div>

          <div className="fieldRow">
            <span>Date of Birth</span>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={dob}
                onChange={(v) => setDob(v)}
                views={["year", "month", "day"]}
                openTo="year"
                format="yyyy-MM-dd"
                reduceAnimations
                slotProps={{
                  textField: {
                    size: "small",
                    className: "dateInput",
                    placeholder: "YYYY-MM-DD",
                  },
                  popper: { className: "datePopper" },
                }}
                maxDate={new Date()}
              />
            </LocalizationProvider>
            <input type="hidden" name="dateOfBirth" value={formatDate(dob)} />
          </div>

          <div className="fieldRow">
            <span>Address</span>
            <input type="text" name="address" placeholder="123 Main St" />
          </div>

          <button className="primaryBtn" type="submit">
            Sign up
          </button>
        </form>

        <div className="modalFooter">
          <button type="button" className="secondaryBtn" onClick={onOpenLogin}>
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  );
}
