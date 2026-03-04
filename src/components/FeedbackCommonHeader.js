import React from "react";
import "../styles/feedbackCommonHeader.scss";

const FeedbackCommonHeader = ({
  title = "360° Survey Feedback – Key Highlights",
  right,
  className = "",
}) => {
  return (
    <div className={`feedback-common-header ${className}`.trim()}>
      <div className="feedback-common-header__top">
        <div className="feedback-common-header__title" style={right ? { width: "80%" } : { width: "100%" }}>{title}</div>
        {right ? <div className="feedback-common-header__right">{right}</div> : null}
      </div>
      <div className="feedback-common-header__underline" />
    </div>
  );
};

export default FeedbackCommonHeader;
