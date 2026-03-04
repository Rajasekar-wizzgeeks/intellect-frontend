import React from "react";
import logoGreen from "../assets/png/intellectGreenLogo.png";
import "../styles/header.scss";

const Header = ({
  left = "LEADERSHIP",
  center = "ASSESSMENT",
  right = "REPORT",
}) => {
  return (
    <header className="report-header" role="banner">
      <div className="report-header__row">
        <div className="report-header__cell report-header__cell--left">
          <div className="report-header__title">{left}</div>
          <img
            src={logoGreen}
            alt="intellect logo"
            className="report-header__logo"
          />
        </div>
        <div className="report-header__cell report-header__cell--center">
          <div className="report-header__title">{center}</div>
        </div>
        <div className="report-header__cell report-header__cell--right">
          <div className="report-header__title">{right}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
