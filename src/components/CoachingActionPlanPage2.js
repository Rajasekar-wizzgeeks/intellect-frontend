import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  onDataChange,
  savedData,
}) => {
  const [takeaway, setTakeaway] = useState(() => savedData?.takeaway ?? "");
  const [focusAreas, setFocusAreas] = useState(
    () => savedData?.focusAreas ?? Array.from({ length: tableRows }, () => ({ focusArea: "", learningGoal: "" }))
  );

  useEffect(() => {
    setTakeaway(savedData?.takeaway ?? "");
    setFocusAreas(savedData?.focusAreas ?? Array.from({ length: tableRows }, () => ({ focusArea: "", learningGoal: "" })));
  }, [savedData, tableRows]);

  const notifyChange = useCallback((nextTakeaway, nextFocusAreas) => {
    if (onDataChange) {
      onDataChange({
        takeaway: nextTakeaway ?? takeaway,
        focusAreas: nextFocusAreas ?? focusAreas,
      });
    }
  }, [onDataChange, takeaway, focusAreas]);

  const handleTakeawayChange = useCallback((e) => {
    const val = e.target.value;
    setTakeaway(val);
    notifyChange(val, focusAreas);
  }, [focusAreas, notifyChange]);

  const handleFocusAreaChange = useCallback((rowIndex, field, value) => {
    setFocusAreas((prev) => {
      const next = prev.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      );
      notifyChange(takeaway, next);
      return next;
    });
  }, [takeaway, notifyChange]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div key="takeaway" className="cap-block cap-block--mt8">
        <div className="cap-block__header cap-block-box-border">
          {takeawayTitle}
        </div>
        <div className="cap-textarea cap-textarea--lg">
          <textarea className="cap-textarea__input" value={takeaway} onChange={handleTakeawayChange} />
        </div>
      </div>
    );

    out.push(
      <div key="goals" className="cap-grid2">
        <div className="cap-grid2__header">
          <div className="cap-grid2__th">{tableHeaders[0]}</div>
          <div className="cap-grid2__th">{tableHeaders[1]}</div>
        </div>
        {focusAreas.map((row, i) => (
          <div key={`row-${i}`} className="cap-grid2__row">
            <div className="cap-grid2__td">
              <input className="cap-input" type="text" value={row.focusArea} onChange={(e) => handleFocusAreaChange(i, "focusArea", e.target.value)} />
            </div>
            <div className="cap-grid2__td">
              <input className="cap-input" type="text" value={row.learningGoal} onChange={(e) => handleFocusAreaChange(i, "learningGoal", e.target.value)} />
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
  }, [takeawayTitle, tableHeaders, tableRows, takeaway, focusAreas, handleTakeawayChange, handleFocusAreaChange]);

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
