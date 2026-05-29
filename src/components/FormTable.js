import React from "react";
import "../styles/coachingActionPlan.scss";


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
        {rows.map((row, i) => {
          const label = typeof row === "object" && row !== null ? row.label : row;
          const value = typeof row === "object" && row !== null ? (row.value ?? "") : "";
          return (
            <div
              className="cap-tr"
              key={i}
              style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
            >
              <div className="cap-td cap-td--label">{label}</div>
              <div className="cap-td">
                <input className="cap-input" type="text" defaultValue={value} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormTable;
