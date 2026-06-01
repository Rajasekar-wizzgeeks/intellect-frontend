import React, { useEffect, useState } from "react";
import logo from "../assets/png/intellectBrownLogo.png";
import bgImage from "../assets/jpeg/initialPage.jpeg";
import "../styles/initialPage.scss";

const InitialPage = ({ initialName = "", onNameChange }) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (onNameChange) onNameChange(val);
  };
  return (
    <div
      className="initial-cover"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="initial-cover__overlay">
        <header className="initial-cover__header">
          <img
            src={logo}
            alt="Intellect logo"
            className="initial-cover__logo"
          />
        </header>

        <main className="initial-cover__content">
          <div className="initial-cover__left-rail" />

          <div className="initial-cover__text">
            <h1 className="initial-cover__title">
              <span>LEADERSHIP</span>
              <span>ASSESSMENT REPORT</span>
            </h1>

            <p className="initial-cover__name">
              <span>Name - </span>
              <input
                type="text"
                className="initial-cover__name-field"
                value={name}
                onChange={handleChange}
                aria-label="Name"
              />
              <span className="initial-cover__name-fallback" aria-hidden="true">
                {name && name.trim().length > 0 ? name : "\u00A0"}
              </span>
            </p>
          </div>
        </main>

        {/* <div className="initial-cover__name-input" aria-label="Name input">
          <label>
            Enter name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a name"
            />
          </label>
        </div> */}
      </div>
    </div>
  );
};

export default InitialPage;
