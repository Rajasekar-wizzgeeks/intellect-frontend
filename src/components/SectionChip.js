import React from "react";
import "../styles/sectionChip.scss";

const SectionChip = ({
  text,
  color = "#0e4a2e",
  textColor = "#fff",
  radius = 18,
  className = "",
}) => {
  return (
    <div className="section-chip-container">
      <div
        className={`section-chip ${className}`.trim()}
        // style={{
        //   backgroundColor: color,
        //   color: textColor,
        //   borderRadius: radius,
        //   ["--chip-color"]: color,
        // }}
      >
        {text}
      </div>
    </div>
  );
};

export default SectionChip;
