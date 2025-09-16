import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Brand from "./Brand.jsx";
import NavLinks from "./NavLinks.jsx";
import MobileToggle from "./MobileToggle.jsx";
import MobileMenu from "./MobileMenu.jsx";
import LoginModal from "../auth/login/LoginModal.jsx";
import SignupModal from "../auth/signup/SignupModal.jsx";
import ForgotPasswordModal from "../auth/forgetPassword/ForgotPasswordModal.jsx";
import "./navbar.css";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);

  const [user, setUser] = useState(getStoredUser());

  const handleNavigate = () => setOpenMenu(false);
  const handleToggleMenu = () => setOpenMenu((v) => !v);

  const openLoginModal = () => {
    setOpenMenu(false);
    setOpenSignup(false);
    setOpenLogin(true);
  };
  const openSignupModal = () => {
    setOpenMenu(false);
    setOpenLogin(false);
    setOpenSignup(true);
  };
  const openCartPopup = () => {
    setOpenMenu(false);
    // TODO: show cart popup/modal here
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setOpenMenu(false);
    window.dispatchEvent(new Event("user:logout"));
  };

  // Lock body scroll when any popup is open
  useEffect(() => {
    const anyOpen = openMenu || openLogin || openSignup || openForgot;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMenu, openLogin, openSignup, openForgot]);

  // Sync user state with localStorage & custom events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") setUser(getStoredUser());
    };
    const onUserChange = () => setUser(getStoredUser());
    window.addEventListener("storage", onStorage);
    window.addEventListener("user:login", onUserChange);
    window.addEventListener("user:logout", onUserChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("user:login", onUserChange);
      window.removeEventListener("user:logout", onUserChange);
    };
  }, []);

  // --- Logo click logic ---
  const handleLogoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (user?.userRole === "admin") {
      if (location.pathname === "/admin/home") {
        navigate("/"); // already on admin → go to user home
      } else {
        navigate("/admin/home"); // not on admin → go to admin home
      }
    } else {
      navigate("/"); // normal users → always user home
    }
  };

  const onLogoKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogoClick(e);
    }
  };

  return (
    <header className="nav">
      <div className="nav__container">
        {/* Logo click wrapper */}
        <div
          className="nav__brandClickable"
          role="link"
          tabIndex={0}
          onClick={handleLogoClick}
          onKeyDown={onLogoKeyDown}
          aria-label="Go home"
        >
          <Brand />
        </div>

        {user && (
          <div className="nav__center hide-on-mobile">
            <span className="welcome-text">Welcome, {user.userName}</span>
          </div>
        )}

        <div className="nav__right hide-on-mobile">
          <nav className="nav__links" aria-label="Primary">
            <NavLinks
              user={user}
              onNavigate={handleNavigate}
              onOpenLogin={openLoginModal}
              onOpenCart={openCartPopup}
              onLogout={handleLogout}
            />
          </nav>
        </div>

        <MobileToggle open={openMenu} onToggle={handleToggleMenu} />
      </div>

      <MobileMenu open={openMenu} onClose={() => setOpenMenu(false)}>
        <NavLinks
          user={user}
          onNavigate={handleNavigate}
          onOpenLogin={openLoginModal}
          onOpenCart={openCartPopup}
          onLogout={handleLogout}
        />
      </MobileMenu>

      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onOpenSignup={openSignupModal}
        onOpenForgot={() => setOpenForgot(true)}
      />
      <SignupModal
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        onOpenLogin={openLoginModal}
      />
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
      />
    </header>
  );
}
