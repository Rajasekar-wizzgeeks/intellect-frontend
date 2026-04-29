import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/contentPage.scss";
import "../styles/coachingActionPlan.scss";

const IndividualDevelopmentPlan = ({
  startPage = 51,
  pageWidth = 794,
  pageHeight = 1100,
  pagePadding = 10,
  titleIndex = "6.",
  titleText = "Individual Developmental Plan",
  headers = [
    "SL No",
    "Goal (Short/Long term)",
    "Action Plan",
    "Due Date",
    "Status",
    "Remarks",
  ],
  rows = 5,
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title idp-title">
        <span className="content-page__title-index-bold">{titleIndex}</span>
        <span className="content-page__title-text-bold">{titleText}</span>
      </h2>
    );

    const bodyRows = Array.from({ length: rows });

    out.push(
      <div key="idp" className="idp-grid6">
        <div className="idp-grid6__header">
          {headers.map((h, i) => (
            <div key={`h-${i}`} className="idp-grid6__th">
              {h}
            </div>
          ))}
        </div>
        {bodyRows.map((_, r) => (
          <div key={`r-${r}`} className="idp-grid6__row">
            {headers.map((_, c) => (
              <div key={`r${r}c${c}`} className="idp-grid6__td">
                {c === 0 || c === 3 || c === 4 ? (
                  <input className="cap-input" type="text" defaultValue="" />
                ) : (
                  <textarea className="cap-textarea__input" defaultValue="" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    const assignmentsHeaders = [
      "SL No",
      "Assignments/ Projects completed",
      "Team",
      "Remarks",
    ];
    const assignmentsRows = Array.from({ length: 5 });

    out.push(
      <div key="assignments-block">
        <div className="section-band">
          Assignments / Cross Functional Projects
        </div>
        <div className="assign-grid4">
          <div className="assign-grid4__header">
            {assignmentsHeaders.map((h, i) => (
              <div key={`ah-${i}`} className="assign-grid4__th">
                {h}
              </div>
            ))}
          </div>
          {assignmentsRows.map((_, r) => (
            <div key={`ar-${r}`} className="assign-grid4__row">
              {assignmentsHeaders.map((_, c) => (
                <div key={`ar${r}c${c}`} className="assign-grid4__td">
                  {c === 0 ? (
                    <input className="cap-input" type="text" defaultValue="" />
                  ) : (
                    <textarea className="cap-textarea__input" defaultValue="" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );

    // Summary section
    out.push(
      <div key="summary-block" className="summary">
        <div className="section-band">Summary</div>
        <div className="summary__box">
          <textarea className="cap-textarea__input" defaultValue="" />
        </div>
      </div>
    );

    return out;
  }, [titleIndex, titleText, headers, rows]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default IndividualDevelopmentPlan;
