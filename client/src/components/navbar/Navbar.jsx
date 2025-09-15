import { useState, useEffect } from "react";
import Brand from "./Brand.jsx";
import NavLinks from "./NavLinks.jsx";
import MobileToggle from "./MobileToggle.jsx";
import MobileMenu from "./MobileMenu.jsx";
import LoginModal from "../auth/login/LoginModal.jsx";
import SignupModal from "../auth/signup/SignupModal.jsx";
import ForgotPasswordModal from "../auth/forgetPassword/ForgotPasswordModal.jsx";
import "./navbar.css";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

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
  };

  // lock body scroll when any popup is open
  useEffect(() => {
    const anyOpen = openMenu || openLogin || openSignup || openForgot;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMenu, openLogin, openSignup, openForgot]);

  return (
    <header className="nav">
      <div className="nav__container">
        <Brand />

        {/* Welcome center */}
        {user && (
          <div className="nav__center hide-on-mobile">
            <span className="welcome-text">Welcome, {user.userName}</span>
          </div>
        )}

        {/* Right side links (desktop) */}
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

        {/* mobile toggle */}
        <MobileToggle open={openMenu} onToggle={handleToggleMenu} />
      </div>

      {/* mobile dropdown under navbar */}
      <MobileMenu open={openMenu} onClose={() => setOpenMenu(false)}>
        <NavLinks
          user={user}
          onNavigate={handleNavigate}
          onOpenLogin={openLoginModal}
          onOpenCart={openCartPopup}
          onLogout={handleLogout}
        />
      </MobileMenu>

      {/* popups */}
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
