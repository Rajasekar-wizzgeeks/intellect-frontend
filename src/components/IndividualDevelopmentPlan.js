import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  onDataChange,
  savedData,
}) => {
  const makeEmptyGoals = (n) => Array.from({ length: n }, () => ({
    slNo: "", goal: "", actionPlan: "", dueDate: "", status: "", remarks: "",
  }));
  const makeEmptyAssignments = (n) => Array.from({ length: n }, () => ({
    slNo: "", project: "", team: "", remarks: "",
  }));

  const [goals, setGoals] = useState(
    () => savedData?.goals ?? makeEmptyGoals(rows)
  );
  const [assignments, setAssignments] = useState(
    () => savedData?.assignments ?? makeEmptyAssignments(5)
  );
  const [summary, setSummary] = useState(() => savedData?.summary ?? "");

  useEffect(() => {
    setGoals(savedData?.goals ?? makeEmptyGoals(rows));
    setAssignments(savedData?.assignments ?? makeEmptyAssignments(5));
    setSummary(savedData?.summary ?? "");
  }, [savedData, rows]);

  const notifyChange = useCallback((nextGoals, nextAssignments, nextSummary) => {
    if (onDataChange) {
      onDataChange({
        goals: nextGoals ?? goals,
        assignments: nextAssignments ?? assignments,
        summary: nextSummary ?? summary,
      });
    }
  }, [onDataChange, goals, assignments, summary]);

  const handleGoalChange = useCallback((rowIndex, field, value) => {
    setGoals((prev) => {
      const next = prev.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      );
      notifyChange(next, null, null);
      return next;
    });
  }, [notifyChange]);

  const handleAssignmentChange = useCallback((rowIndex, field, value) => {
    setAssignments((prev) => {
      const next = prev.map((row, i) =>
        i === rowIndex ? { ...row, [field]: value } : row
      );
      notifyChange(null, next, null);
      return next;
    });
  }, [notifyChange]);

  const handleSummaryChange = useCallback((e) => {
    const val = e.target.value;
    setSummary(val);
    notifyChange(null, null, val);
  }, [notifyChange]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title idp-title">
        <span className="content-page__title-index-bold">{titleIndex}</span>
        <span className="content-page__title-text-bold">{titleText}</span>
      </h2>
    );

    out.push(
      <div key="idp" className="idp-grid6">
        <div className="idp-grid6__header">
          {headers.map((h, i) => (
            <div key={`h-${i}`} className="idp-grid6__th">
              {h}
            </div>
          ))}
        </div>
        {goals.map((row, r) => (
          <div key={`r-${r}`} className="idp-grid6__row">
            <div className="idp-grid6__td">
              <input className="cap-input" type="text" value={row.slNo} onChange={(e) => handleGoalChange(r, "slNo", e.target.value)} />
            </div>
            <div className="idp-grid6__td">
              <textarea className="cap-textarea__input" value={row.goal} onChange={(e) => handleGoalChange(r, "goal", e.target.value)} />
            </div>
            <div className="idp-grid6__td">
              <textarea className="cap-textarea__input" value={row.actionPlan} onChange={(e) => handleGoalChange(r, "actionPlan", e.target.value)} />
            </div>
            <div className="idp-grid6__td">
              <input className="cap-input" type="text" value={row.dueDate} onChange={(e) => handleGoalChange(r, "dueDate", e.target.value)} />
            </div>
            <div className="idp-grid6__td">
              <input className="cap-input" type="text" value={row.status} onChange={(e) => handleGoalChange(r, "status", e.target.value)} />
            </div>
            <div className="idp-grid6__td">
              <textarea className="cap-textarea__input" value={row.remarks} onChange={(e) => handleGoalChange(r, "remarks", e.target.value)} />
            </div>
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
          {assignments.map((row, r) => (
            <div key={`ar-${r}`} className="assign-grid4__row">
              <div className="assign-grid4__td">
                <input className="cap-input" type="text" value={row.slNo} onChange={(e) => handleAssignmentChange(r, "slNo", e.target.value)} />
              </div>
              <div className="assign-grid4__td">
                <textarea className="cap-textarea__input" value={row.project} onChange={(e) => handleAssignmentChange(r, "project", e.target.value)} />
              </div>
              <div className="assign-grid4__td">
                <textarea className="cap-textarea__input" value={row.team} onChange={(e) => handleAssignmentChange(r, "team", e.target.value)} />
              </div>
              <div className="assign-grid4__td">
                <textarea className="cap-textarea__input" value={row.remarks} onChange={(e) => handleAssignmentChange(r, "remarks", e.target.value)} />
              </div>
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
          <textarea className="cap-textarea__input" value={summary} onChange={handleSummaryChange} />
        </div>
      </div>
    );

    return out;
  }, [titleIndex, titleText, headers, rows, goals, assignments, summary, handleGoalChange, handleAssignmentChange, handleSummaryChange]);

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
