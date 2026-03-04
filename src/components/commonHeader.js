import React, { useState } from "react";
import {
  Search,
  Bell,
  User,
  Settings,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/commonHeader.scss";

const CommonHeader = ({ headerName, handleBackNavigate, showBackIcon }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="common-header">
      <div className="common-header__inner">
        <div className="common-header__left">
          {showBackIcon && (
            <button
              type="button"
              className="common-header__back-btn"
              onClick={handleBackNavigate}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="common-header__title">{headerName}</h1>
            {/* <p className="common-header__subtitle">
              Welcome back, John Doe
            </p> */}
          </div>
        </div>

        {/* <div className="common-header__right">
          <div className="common-header__search">
            <Search className="common-header__search-icon" />
            <input
              type="text"
              placeholder="Search reports, users..."
              className="common-header__search-input"
            />
          </div>

          <div className="common-header__notif-wrap">
            <button
              className="common-header__notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="common-header__notif-icon" />
              <span
                className="common-header__notif-badge"
              >
                3
              </span>
            </button>

            {showNotifications && (
              <div className="common-header__dropdown">
                <div className="common-header__dropdown-header">
                  <h3 className="common-header__dropdown-title">
                    Notifications
                  </h3>
                </div>
                <div className="common-header__dropdown-body">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="common-header__dropdown-item"
                    >
                      <p className="common-header__dropdown-text">
                        New report generated
                      </p>
                      <p className="common-header__dropdown-subtext">
                        2 hours ago
                      </p>
                    </div>
                  ))}
                </div>
                <div className="common-header__dropdown-footer">
                  <span>View all notifications</span>
                </div>
              </div>
            )}
          </div>

          <div className="common-header__divider" />

          <div className="common-header__user-wrap">
            <button
              className="common-header__user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="common-header__user-avatar">
                <User className="common-header__user-icon" />
              </div>
              <div className="common-header__user-meta">
                <p className="common-header__user-name">
                  John Doe
                </p>
                <p className="common-header__user-role">
                  Admin
                </p>
              </div>
              <ChevronDown className="common-header__user-chevron" />
            </button>

            {showUserMenu && (
              <div className="common-header__user-dropdown">
                <div className="common-header__user-dropdown-header">
                  <p className="common-header__user-name">
                    John Doe
                  </p>
                  <p className="common-header__user-email">
                    john.doe@company.com
                  </p>
                </div>
                <div className="common-header__user-dropdown-body">
                  <a
                    href="#"
                    className="common-header__user-link"
                  >
                    <User className="common-header__user-link-icon" />
                    <span>My Profile</span>
                  </a>
                  <a
                    href="#"
                    className="common-header__user-link"
                  >
                    <Settings className="common-header__user-link-icon" />
                    <span>Settings</span>
                  </a>
                </div>
                <div className="common-header__user-dropdown-footer">
                  <a
                    href="#"
                    className="common-header__user-link"
                  >
                    <span>Sign Out</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default CommonHeader;
