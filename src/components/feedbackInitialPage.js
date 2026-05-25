import React, { useEffect, useRef, useState } from "react";
import "../styles/feedbackInitialPage.scss";
import ReportCycle from "../assets/png/ReportCycle.png";

const FeedbackInitialPage = ({ initialName = "", date = "", onDataChange }) => {
  const [name, setName] = useState(initialName);
  const [dateValue, setDateValue] = useState(date);

  const [isDateEditing, setIsDateEditing] = useState(false);
  const [dateDraft, setDateDraft] = useState(date);

  const onDataChangeRef = useRef(onDataChange);
  const lastEmittedSigRef = useRef("");
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  const emitDataChange = (nextName, nextDate) => {
    const cb = onDataChangeRef.current;
    if (!cb) return;
    const payload = { name: nextName, date: nextDate };
    let sig;
    try {
      sig = JSON.stringify(payload);
    } catch {
      return;
    }
    if (sig === lastEmittedSigRef.current) return;
    lastEmittedSigRef.current = sig;
    cb(payload);
  };

  useEffect(() => {
    setName(initialName);
    setDateValue(date);
    setDateDraft(date);
  }, [initialName, date]);

  return (
    <div className="feedback-initial-viewport">
      <div className="feedback-initial-card">
        {/* <div className="feedback-initial-blob-top" />
        <div className="feedback-initial-blob-bottom" /> */}

     

        <div className="feedback-initial-right">
          <img
            className="feedback-initial-image"
            src={ReportCycle}
            alt="360 Feedback Report"
          />
        </div>
           <div className="feedback-initial-left">
            <div className="feedback-initial-left-container">
          <div>
            <h1 className="feedback-initial-title">360 Feedback Report</h1>
            <div className="feedback-initial-underline" />
          </div>

          <div>
            <div className="feedback-initial-name">
              {/* <span>Name -</span> */}
              <textarea
                className="feedback-initial-name-field"
                value={name}
                onChange={(e) => {
                  const nextName = e.target.value;
                  setName(nextName);
                  emitDataChange(nextName, dateValue);
                }}
                aria-label="Name"
                rows={1}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <span
                className="feedback-initial-name-fallback"
                aria-hidden="true"
              >
                {name && name.trim().length > 0 ? name : "\u00A0"}
              </span>
            </div>
            <div
              className="feedback-initial-date"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setDateDraft(dateValue || "");
                setIsDateEditing(true);
              }}
              style={{ cursor: "pointer" }}
            >
              {isDateEditing ? (
                <input
                  value={dateDraft}
                  onChange={(e) => setDateDraft(e.target.value)}
                  onBlur={() => {
                    setDateValue(dateDraft);
                    setIsDateEditing(false);
                    emitDataChange(name, dateDraft);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setDateValue(dateDraft);
                      setIsDateEditing(false);
                      emitDataChange(name, dateDraft);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setDateDraft(dateValue || "");
                      setIsDateEditing(false);
                    }
                  }}
                  autoFocus
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: 0,
                    margin: 0,
                    font: "inherit",
                    color: "inherit",
                    width: "100%",
                  }}
                />
              ) : (
                dateValue || ""
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackInitialPage;
