import React, { useEffect, useState } from "react";
import "../styles/navbar.scss";
import { NavLink, useLocation } from "react-router-dom";
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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activePath, setActivePath] = useState("");
  const location = useLocation();

  useEffect(()=>{
    console.log(location);
    setActivePath(location.pathname === "/" ? "/" :"/");
  },[location])

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
                end
                className={({ isActive }) =>
                  `rh-nav__link ${isActive || activePath === "/" ? "is-active" : ""}`
                }
              >
                <Home className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Home</span>
              </NavLink>

              <NavLink
                to="/reports/drafts"
                className={({ isActive }) =>
                  `rh-nav__link ${isActive ? "is-active" : ""}`
                }
              >
                <FileText className="rh-nav__link-icon" />
                <span className="rh-nav__link-text">Drafts</span>
              </NavLink>

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
                <div className="rh-nav__profile-name">John Doe</div>
                <div className="rh-nav__profile-role">Admin</div>
              </div>
              <button
                type="button"
                className="rh-nav__logout"
                aria-label="Logout"
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
    </>
  );
};

export default Navbar;
