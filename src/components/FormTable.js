import React from "react";
import "../styles/coachingActionPlan.scss";

/**
 * FormTable
 * Reusable two-column table with gold borders and optional green header band.
 * Props:
 * - header: string (optional) -> shown as green band above the table
 * - rows: string[] -> each string is a left label; right cell is empty box
 * - labelWidth: number (px) -> width of left column (default 200)
 */
const FormTable = ({ header, rows = [], labelWidth = 170 }) => {
  return (
    <div className="cap-block">
      {header ? (
        <div className="cap-block__header cap-label--green">{header}</div>
      ) : null}
      <div
        className="cap-table"
        style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
      >
        {rows.map((label, i) => (
          <div
            className="cap-tr"
            key={i}
            style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
          >
            <div className="cap-td cap-td--label">{label}</div>
            <div className="cap-td" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormTable;
