import React, { useState } from "react";

const ComparisonTable = ({ 
  computedComparisonRows, 
  comparisonHasDiff1, 
  comparisonHasDiff2, 
  currentYear, 
  file2Year, 
  file3Year,
  onCellBlur,
  title
}) => {
  const [editingCell, setEditingCell] = useState(null);

  const formatDiff = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    const isPos = n > 0;
    return `${isPos ? "+" : ""}${n
      .toFixed(2)
      .replace(/0$/, "")
      .replace(/\.0$/, "")}`;
  };

  const handleBlur = (rowIndex, fieldKey, value, label) => {
    onCellBlur(rowIndex, fieldKey, value, label);
    setEditingCell(null);
  };

  return (
    <div
      className="sbc-compare__table"
      role="table"
      aria-label="Comparison table"
    >
      <div className="sbc-compare__thead" role="rowgroup">
        <div
          className="sbc-compare__tr"
          role="row"
          style={{
            gridTemplateColumns: comparisonHasDiff2
              ? "1fr 130px 130px"
              : "1fr 130px",
          }}
        >
          <div className="sbc-compare__th" role="columnheader">
            {title}
          </div>
          {comparisonHasDiff1 ? (
            <div
              className="sbc-compare__th sbc-compare__th--right"
              role="columnheader"
            >
              Difference - {currentYear} Vs {file2Year}
            </div>
          ) : null}
          {comparisonHasDiff2 ? (
            <div
              className="sbc-compare__th sbc-compare__th--right"
              role="columnheader"
            >
              Difference - {file2Year} Vs {file3Year}
            </div>
          ) : null}
        </div>
      </div>

      <div className="sbc-compare__tbody" role="rowgroup">
        {computedComparisonRows.map((r, i) => {
          const n1 = Number(r?.team_diff1);
          const n2 = Number(r?.team_diff2);
          const isPos1 = Number.isFinite(n1) && n1 > 0;
          const isNeg1 = Number.isFinite(n1) && n1 < 0;
          const isPos2 = Number.isFinite(n2) && n2 > 0;
          const isNeg2 = Number.isFinite(n2) && n2 < 0;

          return (
            <div
              key={i}
              className="sbc-compare__tr"
              role="row"
              style={{
                gridTemplateColumns: comparisonHasDiff2
                  ? "1fr 130px 130px"
                  : "1fr 130px",
              }}
            >
              <div className="sbc-compare__td" role="cell">
                {r.label}
              </div>
              {comparisonHasDiff1 ? (
                <div
                  className={`sbc-compare__td
                    ${comparisonHasDiff2 ? "sbc-compare__td--center" : "sbc-compare__td--right"}  ${
                    isPos1
                      ? "sbc-compare__td--pos"
                      : isNeg1
                        ? "sbc-compare__td--neg"
                        : ""
                  }`.trim()}
                  role="cell"
                  onDoubleClick={() =>
                    setEditingCell({
                      rowIndex: i,
                      fieldKey: "team_diff1",
                      value: String(n1 || ""),
                      label: r.label,
                    })
                  }
                >
                  {editingCell &&
                  editingCell.rowIndex === i &&
                  editingCell.fieldKey === "team_diff1" ? (
                    <input
                      type="number"
                      className="sbc-compare__input"
                      value={editingCell.value}
                      autoFocus
                      onChange={(e) =>
                        setEditingCell((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      onBlur={(e) =>
                        handleBlur(i, "team_diff1", e.target.value, r.label)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                    />
                  ) : (
                    formatDiff(n1)
                  )}
                </div>
              ) : null}
              {comparisonHasDiff2 ? (
                <div
                  className={`sbc-compare__td sbc-compare__td--right ${
                    isPos2
                      ? "sbc-compare__td--pos"
                      : isNeg2
                        ? "sbc-compare__td--neg"
                        : ""
                  }`.trim()}
                  role="cell"
                  onDoubleClick={() =>
                    setEditingCell({
                      rowIndex: i,
                      fieldKey: "team_diff2",
                      value: String(n2 || ""),
                      label: r.label,
                    })
                  }
                >
                  {editingCell &&
                  editingCell.rowIndex === i &&
                  editingCell.fieldKey === "team_diff2" ? (
                    <input
                      type="number"
                      className="sbc-compare__input"
                      value={editingCell.value}
                      autoFocus
                      onChange={(e) =>
                        setEditingCell((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      onBlur={(e) =>
                        handleBlur(i, "team_diff2", e.target.value, r.label)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                    />
                  ) : (
                    formatDiff(n2)
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ComparisonTable);
