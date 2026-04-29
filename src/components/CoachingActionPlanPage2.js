import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/contentPage.scss";
import "../styles/coachingActionPlan.scss";

const CoachingActionPlanPage2 = ({
  startPage = 50,
  pageWidth = 794,
  pageHeight = 900,
  pagePadding = 10,
  takeawayTitle = "Talent Discovery Dialogue Takeaway",
  tableHeaders = ["Focus Area", "Learning Goals"],
  tableRows = 5,
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div key="takeaway" className="cap-block cap-block--mt8">
        <div className="cap-block__header cap-block-box-border">
          {takeawayTitle}
        </div>
        <div className="cap-textarea cap-textarea--lg">
          <textarea className="cap-textarea__input" defaultValue="" />
        </div>
      </div>
    );

    const rows = Array.from({ length: tableRows });
    out.push(
      <div key="goals" className="cap-grid2">
        <div className="cap-grid2__header">
          <div className="cap-grid2__th">{tableHeaders[0]}</div>
          <div className="cap-grid2__th">{tableHeaders[1]}</div>
        </div>
        {rows.map((_, i) => (
          <div key={`row-${i}`} className="cap-grid2__row">
            <div className="cap-grid2__td">
              <input className="cap-input" type="text" defaultValue="" />
            </div>
            <div className="cap-grid2__td">
              <input className="cap-input" type="text" defaultValue="" />
            </div>
          </div>
        ))}
      </div>
    );

    // Signatures
    out.push(
      <div key="sigs" className="cap-signatures">
        <div className="cap-signature">
          <div className="cap-signature__line" />
          <div className="cap-signature__label">Manager Signature</div>
        </div>
        <div className="cap-signature">
          <div className="cap-signature__line" />
          <div className="cap-signature__label">Coach Signature</div>
        </div>
      </div>
    );

    return out;
  }, [takeawayTitle, tableHeaders, tableRows]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default CoachingActionPlanPage2;
