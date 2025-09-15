import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./SignupModal.css";

export default function SignupModal({ open, onClose, onOpenLogin }) {
  // Hooks MUST be before any return
  const [dob, setDob] = useState(null);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle signup (read form fields from e.target or a form lib)
  };

  // format Date -> "yyyy-MM-dd" for backend
  const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" aria-label="Create account dialog">
      <div className="modalCard">
        <header className="modalHead">
          <h2 className="modalTitle">Create account</h2>
          <button className="iconBtn" aria-label="Close" onClick={onClose}>✕</button>
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
            <input type="text" name="userName" required placeholder="johndoe123" />
          </div>

          <div className="fieldRow">
            <span>Email</span>
            <input type="email" name="email" required placeholder="you@example.com" />
          </div>

          <div className="fieldRow">
            <span>Password</span>
            <input type="password" name="password" required minLength={6} placeholder="••••••••" />
          </div>

          <div className="fieldRow">
            <span>Confirm Password</span>
            <input type="password" name="confirmPassword" required minLength={6} placeholder="••••••••" />
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
                // Make the input compact & 255px wide (styled via CSS class)
                slotProps={{
                  textField: {
                    size: "small",
                    className: "dateInput",
                    placeholder: "Select date",
                  },
                }}
                maxDate={new Date()}
              />
            </LocalizationProvider>
            {/* submit formatted date */}
            <input type="hidden" name="dateOfBirth" value={formatDate(dob)} />
          </div>

          <div className="fieldRow">
            <span>Address</span>
            <input type="text" name="address" placeholder="123 Main St" />
          </div>

          <button className="primaryBtn" type="submit">Sign up</button>
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
