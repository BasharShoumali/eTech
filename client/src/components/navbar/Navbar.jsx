// src/components/navbar/Navbar.jsx
import { useState, useEffect } from "react";
import Brand from "./Brand.jsx";
import NavLinks from "./NavLinks.jsx";
import MobileToggle from "./MobileToggle.jsx";
import MobileMenu from "./MobileMenu.jsx";
import LoginModal from "../auth/login/LoginModal.jsx";
import SignupModal from "../auth/signup/SignupModal.jsx"; // adjust path if needed
import "./navbar.css";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

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

  // lock body scroll when any popup is open
  useEffect(() => {
    const anyOpen = openMenu || openLogin || openSignup;
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openMenu, openLogin, openSignup]);

  return (
    <header className="nav">
      <div className="nav__container">
        <Brand />

        {/* desktop links */}
        <div className="nav__right hide-on-mobile">
          <nav className="nav__links" aria-label="Primary">
            <NavLinks
              onNavigate={handleNavigate}
              onOpenLogin={openLoginModal}
              onOpenCart={openCartPopup}
            />
          </nav>
        </div>

        {/* mobile toggle */}
        <MobileToggle open={openMenu} onToggle={handleToggleMenu} />
      </div>

      {/* mobile dropdown under navbar */}
      <MobileMenu open={openMenu} onClose={() => setOpenMenu(false)}>
        <NavLinks
          onNavigate={handleNavigate}
          onOpenLogin={openLoginModal}
          onOpenCart={openCartPopup}
        />
      </MobileMenu>

      {/* popups */}
      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onOpenSignup={openSignupModal} // <-- this triggers the signup popup
      />
      <SignupModal
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        onOpenLogin={openLoginModal}
      />
    </header>
  );
}
