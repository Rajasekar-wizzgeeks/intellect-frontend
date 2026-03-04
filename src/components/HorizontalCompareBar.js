import React, { useEffect, useMemo, useState } from "react";
import "../styles/horizontalCompareBar.scss";

const HorizontalCompareBar = ({
  selfLabel = "Self",
  othersLabel = "Others",
  self = 2.5,
  others = 4.0,
  max = 5,
  width = "100%",
  height = 70,
  colors = {
    self: "var(--color-green)", // dark green for Self
    others: "var(--color-gold)", // gold for managers/team
    track: "var(--color-bg)",
    border: "var(--color-muted)",
  },
  rows,
  showTicks = true,
  editableValues = false,
  onValuesChange,
  onRowsChange,
}) => {
  const [localValues, setLocalValues] = useState({ self, others });
  const [localRows, setLocalRows] = useState(rows);
  const [editValue, setEditValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState({
    field: null,
    rowIndex: null,
  });

  useEffect(() => {
    setLocalValues({ self, others });
  }, [self, others]);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const selfNum = useMemo(() => {
    const v = editableValues ? localValues.self : self;
    const n = Number(v);
    return Number.isFinite(n) ? n : parseFloat(v) || 0;
  }, [editableValues, localValues.self, self]);

  const othersNum = useMemo(() => {
    const v = editableValues ? localValues.others : others;
    const n = Number(v);
    return Number.isFinite(n) ? n : parseFloat(v) || 0;
  }, [editableValues, localValues.others, others]);

  const handleValueClick = (field, value) => {
    if (!editableValues) return;
    setCurrentEdit({ field, rowIndex: null });
    setEditValue(String(value ?? ""));
  };

  const handleRowValueClick = (rowIndex, value) => {
    if (!editableValues) return;
    setCurrentEdit({ field: "rows", rowIndex });
    setEditValue(String(value ?? ""));
  };

  const handleValueChange = (e) => {
    setEditValue(e.target.value);
  };

  const commitEdit = () => {
    if (!currentEdit.field) {
      setCurrentEdit({ field: null, rowIndex: null });
      return;
    }

    if (currentEdit.field === "rows") {
      const idx = currentEdit.rowIndex;
      if (typeof idx !== "number") {
        setCurrentEdit({ field: null, rowIndex: null });
        return;
      }

      const nextRows = Array.isArray(localRows) ? [...localRows] : [];
      if (!nextRows[idx]) {
        setCurrentEdit({ field: null, rowIndex: null });
        return;
      }

      nextRows[idx] = {
        ...nextRows[idx],
        value: editValue,
      };

      setLocalRows(nextRows);
      onRowsChange?.(nextRows);
      setCurrentEdit({ field: null, rowIndex: null });
      return;
    }

    const field = currentEdit.field;
    const nextValues = {
      ...localValues,
      [field]: editValue,
    };

    setLocalValues(nextValues);
    onValuesChange?.(nextValues);
    setCurrentEdit({ field: null, rowIndex: null });
  };

  const handleValueBlur = () => {
    commitEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const isNumericWidth = typeof width === "number";
  const containerStyle = {
    width: isNumericWidth ? width : "100%",
    "--hcb-border": colors.border,
    "--hcb-track": colors.track,
  };

  const barHeight = 18;
  const padX = 12;
  const colorPicker = (value) => {
    if (value <= 3.5) {
      return "var(--color-gold)";
    } else if (value > 3.5 && value <= 4) {
      return "var(--color-mint)";
    } else if (value > 4) {
      return "var(--color-green-mid)";
    }
    return "#ffffff";
  };

  const widthCSSVarFor = (value) => {
    if (isNumericWidth) {
      const innerWidth = width - 2; // border
      const trackWidth = innerWidth - padX * 2;
      const w = Math.max(0, Math.min(1, value / max)) * trackWidth;
      return `${w}px`;
    }
    const pct = Math.max(0, Math.min(1, value / max)) * 100;
    return `${pct}%`;
  };

  const labelColorFor = (hex) => {
    try {
      const h = (hex || "").replace("#", "");
      if (h.length !== 6) return "#ffffff";
      const r = parseInt(h.substring(0, 2), 16) / 255;
      const g = parseInt(h.substring(2, 4), 16) / 255;
      const b = parseInt(h.substring(4, 6), 16) / 255;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luminance > 0.65 ? "#35624b" : "#ffffff";
    } catch {
      return "#ffffff";
    }
  };

  if (Array.isArray(rows) && rows.length) {
    const rws = editableValues && Array.isArray(localRows) ? localRows : rows;

    return (
      <div className={editableValues ? "hcb-values-row-container" : undefined}>
        <div
          role="figure"
          aria-label={`Horizontal bars up to ${max}`}
          className="hcb"
          style={{
            ...containerStyle,
            "--hcb-pad-x": `${padX}px`,
            "--hcb-bar-h": `${barHeight}px`,
          }}
        >
          <div className="hcb-rows">
            {rws.map((r, idx) => {
              const valueNum = Number.isFinite(Number(r.value))
                ? Number(r.value)
                : parseFloat(r.value) || 0;

              const fill =
                valueNum <= 3.5
                  ? "var(--color-gold)"
                  : valueNum > 3.5 && valueNum <= 4
                    ? "var(--color-mint)"
                    : valueNum > 4
                      ? "var(--color-green-mid)"
                      : null;
              const textColor = r.textColor || labelColorFor(fill);

              return (
                <div
                  key={idx}
                  className={`hcb-row ${idx === 0 ? "hcb-row--first" : ""}`}
                  style={{ "--hcb-row-h": `${barHeight + 15}px` }}
                >
                  <div className="hcb-track">
                    <div
                      className="hcb-fill"
                      style={{
                        "--hcb-fill-w": widthCSSVarFor(valueNum),
                        "--hcb-fill-color": fill,
                      }}
                    />
                    <span
                      className="hcb-label"
                      style={{ "--hcb-label-color": textColor }}
                    >
                      {r.label}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="hcb-bottom" />
          </div>

          {showTicks && (
            <div className="hcb-ticks" style={{ padding: `6px 0 6px` }}>
              {Array.from({ length: max + 1 }).map((_, i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
          )}
        </div>

        {editableValues && (
          <div className="hcb-values">
            {rws.map((r, idx) => (
              <div
                key={idx}
                className={`hcb-stat ${
                  currentEdit.field === "rows" && currentEdit.rowIndex === idx
                    ? "editing"
                    : ""
                }`}
                onClick={() => handleRowValueClick(idx, r.value)}
              >
                {currentEdit.field === "rows" &&
                currentEdit.rowIndex === idx ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleValueChange}
                    onBlur={handleValueBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="hcb-input"
                  />
                ) : (
                  <span>{r.value}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  let selfWidth, othersWidth;
  if (isNumericWidth) {
    const innerWidth = width - 2; // border
    const trackWidth = innerWidth - padX * 2;
    const selfW = Math.max(0, Math.min(1, selfNum / max)) * trackWidth;
    const othersW = Math.max(0, Math.min(1, othersNum / max)) * trackWidth;
    selfWidth = `${selfW}px`;
    othersWidth = `${othersW}px`;
  } else {
    const selfPct = Math.max(0, Math.min(1, selfNum / max)) * 100;
    const othersPct = Math.max(0, Math.min(1, othersNum / max)) * 100;
    selfWidth = `${selfPct}%`;
    othersWidth = `${othersPct}%`;
  }

  return (
    <div className="hcb-values-row-container">
      <div
        role="figure"
        aria-label={`${selfLabel} ${selfNum} vs ${othersLabel} ${othersNum} out of ${max}`}
        className="hcb"
        style={{
          ...containerStyle,
          padding: "0 0 6px",
          "--hcb-pad-x": `${padX}px`,
          "--hcb-bar-h": `${barHeight}px`,
        }}
      >
        <div className="hcb-rows">
          {/* Self row */}
          <div
            className="hcb-row hcb-row--self"
            // style={{ "--hcb-row-h": `${barHeight + 8}px` }}
          >
            <div className="hcb-track">
              <div
                className="hcb-fill"
                style={{
                  "--hcb-fill-w": selfWidth,
                  "--hcb-fill-color": colorPicker(selfNum),
                }}
              />
              <span
                className="hcb-label"
                style={{ "--hcb-label-color": labelColorFor(colors.self) }}
              >
                {selfLabel}
              </span>
            </div>
          </div>
          {/* Others row */}
          <div
            className="hcb-row hcb-row--others"
            style={{ "--hcb-row-h": `${barHeight + 15}px` }}
          >
            <div className="hcb-track">
              <div
                className="hcb-fill"
                style={{
                  "--hcb-fill-w": othersWidth,
                  "--hcb-fill-color": colorPicker(othersNum),
                }}
              />
              <span
                className="hcb-label"
                style={{ "--hcb-label-color": labelColorFor(colors.others) }}
              >
                {othersLabel}
              </span>
            </div>
          </div>
        </div>

        {showTicks && (
          <div className="hcb-ticks" style={{ padding: `6px 0 0` }}>
            {Array.from({ length: max + 1 }).map((_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        )}
      </div>
      {editableValues && (
        <div className="hcb-values">
          <div
            className={`hcb-stat ${currentEdit.field === "self" ? "editing" : ""}`}
            onClick={() => handleValueClick("self", localValues.self)}
          >
            {currentEdit.field === "self" ? (
              <input
                type="text"
                value={editValue}
                onChange={handleValueChange}
                onBlur={handleValueBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="hcb-input"
              />
            ) : (
              <span>{localValues.self}</span>
            )}
          </div>
          <div
            className={`hcb-stat ${currentEdit.field === "others" ? "editing" : ""}`}
            onClick={() => handleValueClick("others", localValues.others)}
          >
            {currentEdit.field === "others" ? (
              <input
                type="text"
                value={editValue}
                onChange={handleValueChange}
                onBlur={handleValueBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="hcb-input"
              />
            ) : (
              <span>{localValues.others}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalCompareBar;
