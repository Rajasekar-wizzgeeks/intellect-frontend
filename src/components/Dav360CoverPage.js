import React from "react";
import "../styles/dav360CoverPage.scss";
import ReportCycle from "../assets/png/ReportCycle.png";

const Dav360CoverPage = ({ title = "DAV 360 Degree Feedback\nSummary Report", imageSrc = ReportCycle }) => {
  return (
    <div className="dav360-cover">
      <div className="dav360-cover__image-wrap">
        <img className="dav360-cover__image" src={imageSrc} alt="360 feedback" />
      </div>
      <div className="dav360-cover__divider" />
      <div className="dav360-cover__title">{title}</div>
    </div>
  );
};

export default Dav360CoverPage;
