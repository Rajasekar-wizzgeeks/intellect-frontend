import React, { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import DeleteConfirmPopup from "./DeleteConfirmPopup";
import { getStoredUser } from "../helper/getStoredUser";
import { logoutUser } from "../helper/apicalls/auth";
import {
  BarChart3,
  Bell,
  FileText,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Target,
  User,
  X,
} from "lucide-react";
import logoGreen from "../assets/png/intellectGreenLogo.png";

const navLinkClassName = ({ isActive }) =>
  `rh-nav__link ${isActive ? "is-active" : ""}`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [storedUser, setStoredUser] = useState(() => getStoredUser());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/user/") ||
    location.pathname.startsWith("/reports/user");

  useEffect(() => {
    setStoredUser(getStoredUser());
  }, [location]);

  const displayName =
    storedUser?.name ||
    storedUser?.full_name ||
    storedUser?.username ||
    (storedUser?.email ? String(storedUser.email).split("@")[0] : "User");

  const displayEmail = storedUser?.email || "";

  const openLogoutConfirm = () => {
    if (isLoggingOut) return;
    setLogoutError("");
    setShowLogoutConfirm(true);
  };

  const closeLogoutConfirm = () => {
    if (isLoggingOut) return;
    setShowLogoutConfirm(false);
    setLogoutError("");
  };

  const confirmLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      setLogoutError("");
      await logoutUser();
      setShowLogoutConfirm(false);
      setStoredUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setLogoutError(err.message || "Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="rh-nav__mobile-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        {isOpen ? (
          <X className="rh-nav__toggle-icon" />
        ) : (
          <Menu className="rh-nav__toggle-icon" />
        )}
      </button>

      <aside className={`rh-nav ${isOpen ? "rh-nav--open" : "rh-nav--closed"}`}>
        <div className="rh-nav__inner">
          <div className="rh-nav__top">
            {/* <div className="rh-nav__brand"> */}
              {/* <div className="rh-nav__brand-mark">
                <BarChart3 className="rh-nav__brand-icon" />
              </div> */}
              {/* <div className="rh-nav__brand-text">
                <div className="rh-nav__brand-title">ReportHub</div>
                <div className="rh-nav__brand-subtitle">
                  Analytics Dashboard
                </div>
              </div> */}
                 <img
            src={logoGreen}
            alt="intellect logo"
            className="nav-header-logo"
          />
            {/* </div> */}

            {/* <div className="rh-nav__search">
              <Search className="rh-nav__search-icon" />
              <input className="rh-nav__search-input" placeholder="Search..." />
            </div> */}
          </div>

          <nav className="rh-nav__menu" aria-label="Main navigation">
            <div className="rh-nav__section">
              {/* <div className="rh-nav__section-title">MAIN MENU</div> */}

              <NavLink
                to="/"
                className={`rh-nav__link ${isHomeActive ? "is-active" : ""}`}
              >
                <Home className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Home</span>
              </NavLink>

              <NavLink to="/reports/drafts" className={navLinkClassName}>
                <FileText className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Drafts</span>
              </NavLink>

              {storedUser?.role === "admin" && (
                <NavLink to="/admin/users" className={navLinkClassName}>
                  <User className="rh-nav__link-icon" />
                  <span className="rh-nav__link-text">Users</span>
                </NavLink>
              )}

              {/* <NavLink
                to="/user/reports"
                className={({ isActive }) =>
                  `rh-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                <FileText className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Overall Report</span>
              </NavLink>

              <NavLink
                to="/user/360"
                className={({ isActive }) =>
                  `rh-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                <Target className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">360° Report</span>
              </NavLink>

              <NavLink
                to="/user/analytics"
                className={({ isActive }) =>
                  `rh-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                <BarChart3 className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Analytics</span>
              </NavLink> */}
            </div>

            {/* <div className="rh-nav__divider" />

            <div className="rh-nav__section">
              <div className="rh-nav__section-title">SETTINGS</div>

              <NavLink
                to="/user/preferences"
                className={({ isActive }) =>
                  `rh-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                <Settings className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Preferences</span>
              </NavLink>
            </div> */}
          </nav>

          <div className="rh-nav__bottom">
            <div className="rh-nav__profile">
              <div className="rh-nav__profile-avatar">
                <User className="rh-nav__profile-avatar-icon" />
              </div>
              <div className="rh-nav__profile-meta">
                <div className="rh-nav__profile-name" title={displayName}>
                  {displayName}
                </div>
                <div className="rh-nav__profile-role" title={displayEmail}>
                  {displayEmail || "—"}
                </div>
              </div>
              <button
                type="button"
                className="rh-nav__logout"
                aria-label="Logout"
                onClick={openLogoutConfirm}
                disabled={isLoggingOut}
              >
                <LogOut className="rh-nav__logout-icon" />
              </button>
            </div>

            {/* <div className="rh-nav__notifications">
              <div className="rh-nav__notifications-left">
                <Bell className="rh-nav__notifications-icon" />
                <span className="rh-nav__notifications-text">
                  Notifications
                </span>
              </div>
              <span className="rh-nav__notifications-badge">3</span>
            </div> */}
          </div>
        </div>
      </aside>

      <DeleteConfirmPopup
        isOpen={showLogoutConfirm}
        onClose={closeLogoutConfirm}
        onConfirm={confirmLogout}
        title="Sign out?"
        message={
          <>
            Are you sure you want to sign out
            {displayEmail ? (
              <>
                {" "}
                as <strong>{displayEmail}</strong>
              </>
            ) : null}
            ?
          </>
        }
        isDeleting={isLoggingOut}
        error={logoutError}
        confirmLabel="Sign out"
        loadingLabel="Signing out..."
        ConfirmIcon={LogOut}
      />
    </>
  );
};

export default Navbar;
