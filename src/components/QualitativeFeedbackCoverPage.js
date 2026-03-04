import React from "react";
import "../styles/qualitativeFeedbackCoverPage.scss";
import qualityFeedback from "../assets/png/qualityFeedback.png";

const QualitativeFeedbackCoverPage = ({ title = "Qualitative\nFeedback" }) => {
  return (
    <div className="qf-cover">
      <div className="qf-cover__left">
        <div className="qf-cover__title">{title}</div>
       
      </div>

      <div className="qf-cover__right" aria-hidden="true">
        <div className="qf-cover__circle">
          <img
            className="qf-cover__image"
            src={qualityFeedback}
            alt="Qualitative feedback"
          />
        </div>
      </div>
    </div>
  );
};

export default QualitativeFeedbackCoverPage;
