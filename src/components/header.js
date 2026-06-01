import React from "react";
import logoGreen from "../assets/png/intellectGreenLogo.png";
import "../styles/header.scss";

const Header = ({
  title = "LEADERSHIP ASSESSMENT REPORT",
}) => {
  return (
    <header className="report-header" role="banner">
      <div className="report-header__row">
        <div className="report-header__title">{title}</div>
        <img
          src={logoGreen}
          alt="intellect logo"
          className="report-header__logo"
        />
      </div>
      <hr className="report-header__divider" />
    </header>
  );
};

export default Header;
