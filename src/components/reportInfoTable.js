import React, { useState } from "react";
import "../styles/summaryTable.scss";

const ReportInfoTable = ({
  rows = [],
  headers,
  leftWidth = "36%",
  rightWidth = "64%",
  midWidth = "24%",
  rowHeight,
  className = "",
  extraKey = "extra",
  editable = false,
  onRowsChange,
}) => {
  const hasThird = Array.isArray(headers) && headers.length === 3;
  const [editCell, setEditCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  const styleVars = {
    "--label-col": leftWidth,
    "--value-col": rightWidth,
    ...(hasThird ? { "--mid-col": midWidth } : {}),
    ...(rowHeight ? { "--row-h": `${rowHeight}px` } : {}),
  };

  const startEdit = (rowIdx, field, value) => {
    if (!editable) return;
    setEditCell({ rowIdx, field });
    setEditValue(String(value ?? ""));
  };

  const commitEdit = () => {
    if (!editCell) return;
    const next = rows
      .map((r, i) =>
        i !== editCell.rowIdx ? r : { ...r, [editCell.field]: editValue }
      )
      .filter((r) => String(r.label ?? "").trim() !== "" || String(r.value ?? "").trim() !== "");
    onRowsChange?.(next);
    setEditCell(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.target.blur();
    if (e.key === "Escape") setEditCell(null);
  };

  const addRowAfter = (idx) => {
    const next = [...rows];
    next.splice(idx + 1, 0, { label: "", value: "", [extraKey]: "" });
    onRowsChange?.(next);
  };

  const renderCell = (rowIdx, field, value) => {
    const isEditing = editCell?.rowIdx === rowIdx && editCell?.field === field;
    if (isEditing) {
      return (
        <input
          autoFocus
          className="report-info__edit-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
        />
      );
    }
    return (
      <span
        className={editable ? "report-info__editable-text" : ""}
        onClick={() => startEdit(rowIdx, field, value)}
        title={editable ? "Click to edit" : undefined}
      >
        {value}
      </span>
    );
  };

  return (
    <div className={`report-info ${className}`.trim()}>
      <table className={`report-info__table${editable ? " report-info__table--editable" : ""}`} role="table" style={styleVars}>
        {headers && Array.isArray(headers) && headers.length >= 2 && (
          <thead>
            <tr className="report-info__row">
              <th className="report-info__cell report-info__cell--label report-info-header" scope="col">
                {headers[0]}
              </th>
              <th
                className={`report-info__cell report-info-header ${
                  hasThird ? "report-info__cell--mid" : "report-info__cell--value"
                }`}
                scope="col"
              >
                {headers[1]}
              </th>
              {hasThird && (
                <th className="report-info__cell report-info-header report-info__cell--value" scope="col">
                  {headers[2]}
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={idx}
              className={`report-info__row${editable ? " report-info__row--editable" : ""}`}
              role="row"
            >
              <th scope="row" className="report-info__cell report-info__cell--label">
                {renderCell(idx, "label", r.label)}
              </th>
              <td className={`report-info__cell ${hasThird ? "report-info__cell--mid" : "report-info__cell--value"}`}>
                {renderCell(idx, "value", r.value)}
              </td>
              {hasThird && (
                <td className="report-info__cell report-info__cell--value">
                  {renderCell(idx, extraKey, r[extraKey])}
                </td>
              )}
              {editable && (
                <td className="report-info__cell report-info__cell--add" aria-hidden="true">
                  <button
                    className="report-info__add-btn"
                    title="Add row below"
                    onMouseDown={(e) => { e.preventDefault(); addRowAfter(idx); }}
                  >
                    +
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportInfoTable;
