import React, { useEffect, useState } from "react";
import "../styles/feedbackInitialPage.scss";
import ReportCycle from "../assets/png/ReportCycle.png";

const FeedbackInitialPage = ({ initialName = "" }) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <div className="feedback-initial-viewport">
      <div className="feedback-initial-card">
        {/* <div className="feedback-initial-blob-top" />
        <div className="feedback-initial-blob-bottom" /> */}

        <div className="feedback-initial-left">
          <div>
            <h1 className="feedback-initial-title">360 Feedback Report</h1>
            <div className="feedback-initial-underline" />
          </div>

          <div>
            <div className="feedback-initial-name">
              <span>Name -</span>
              <input
                type="text"
                className="feedback-initial-name-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Name"
              />
              <span
                className="feedback-initial-name-fallback"
                aria-hidden="true"
              >
                {name && name.trim().length > 0 ? name : "\u00A0"}
              </span>
            </div>
            <div className="feedback-initial-date">Feb 2025</div>
          </div>
        </div>

        <div className="feedback-initial-right">
          <img
            className="feedback-initial-image"
            src={ReportCycle}
            alt="360 Feedback Report"
          />
        </div>
      </div>
    </div>
  );
};

export default FeedbackInitialPage;
