import React, { useEffect, useMemo, useState } from "react";
import "../styles/competencyThreeBarChart.scss";

const DEFAULT_LEGEND = [
  {
    key: "groupMean",
    label: "Group Mean (Teachers & Office Staff)",
    color: "var(--chart-series-group-mean)",
  },
  {
    key: "managerRating",
    label: "Manager Rating",
    color: "var(--chart-series-manager-rating)",
  },
  {
    key: "selfRating",
    label: "Self Rating",
    color: "var(--chart-series-self-rating)",
  },
];

const clamp01 = (n) => Math.min(1, Math.max(0, n));

const parseNum = (v) => {
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  const f = parseFloat(v);
  return Number.isFinite(f) ? f : 0;
};

const formatDefault = (n) => {
  if (!Number.isFinite(n)) return "0";
  const fixed = n.toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
};

const CompetencyThreeBarChart = ({
  items = [],
  max = 5,
  barHeight = 6,
  barGap = 10,
  rowPaddingY = 12,
  legendItems = DEFAULT_LEGEND,
  formatValue = formatDefault,
  className = "",
  firstRowBorder = false,
  onRowsChange,
  hideInputField = false,
}) => {  
  // console.log(items,'skndkjnj');
  
  const [rows, setRows] = useState(items);
  const [editing, setEditing] = useState(null); // { rowIndex, seriesKey, value }
  useEffect(() => {
    setRows(items);
  }, [items]);

  const ticks = useMemo(
    () => Array.from({ length: max + 1 }, (_, i) => i),
    [max],
  );

  const showCallouts = useMemo(
    () => rows.some((it) => Boolean(it?.callout)),
    [rows],
  );

  return (
    <div
      className={`ctbc ${showCallouts ? "ctbc--callouts" : ""} ${className}`.trim()}
      style={{
        "--ctbc-bar-h": `${barHeight}px`,
        "--ctbc-gap": `${barGap}px`,
        "--ctbc-row-pad-y": `${rowPaddingY}px`,
        "--ctbc-series-count": legendItems.length,
      }}
    >
      <div className="ctbc__rows">
        {rows.map((row, idx) => {
          const series = legendItems.map((it) => {
            const value = parseNum(row?.[it.key]);
            return {
              ...it,
              value,
              width: `${clamp01(value / max) * 100}%`,
            };
          });

          return (
            <div
              key={row.label || idx}
              className={`ctbc-row   ${
                idx === 0 && firstRowBorder ? "ctbc-row--first" : ""
              } ${idx === rows.length - 1 ? "ctbc-row--last" : ""}`}
            >
              <div className="ctbc-row__label">{row.label}</div>

              <div className="ctbc-row__bars">
                <div className="tbc-row-hr-line"></div>
                {series.map((s) => (
                  <div key={s.key} className="ctbc-bar">
                    <div
                      className="ctbc-bar__track"
                      aria-label={`${s.label} bar`}
                    >
                      <div
                        className="ctbc-bar__fill"
                        style={{
                          width: s.width,
                          background: s.color,
                        }}
                      />
                      {
                        (editing &&
                        editing.rowIndex === idx &&
                        editing.seriesKey === s.key &&
                        !hideInputField ? (
                          <input
                            type="number"
                            className="ctbc-bar__value ctbc-bar__value-input"
                            value={editing.value}
                            autoFocus
                            onChange={(e) =>
                              setEditing((prev) =>
                                prev
                                  ? { ...prev, value: e.target.value }
                                  : prev,
                              )
                            }
                            onBlur={() => {
                              const newVal = parseNum(editing.value);

                              const newRows = rows.map((r, rIdx) =>
                                rIdx === idx ? { ...r, [s.key]: newVal } : r,
                              );
                              setRows(newRows);
                              if (onRowsChange) {
                                onRowsChange(newRows);
                              }

                              setEditing(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              } else if (e.key === "Escape") {
                                setEditing(null);
                              }
                            }}
                          />
                        ) : (
                          <div
                            className="ctbc-bar__value"
                            onDoubleClick={() =>
                              setEditing({
                                rowIndex: idx,
                                seriesKey: s.key,
                                value: String(s.value ?? ""),
                              })
                            }
                          >
                            {s.value === -1 ? "Not given" :  s.value !== 0 ? formatValue(s.value) : "" }
                          </div>
                        ))}
                    </div>
                  </div>
                ))}

                {row.callout ? (
                  <div
                    className={`ctbc-row__callout ctbc-row__callout--${row.callout.variant || "info"}`}
                  >
                    <div
                      className="ctbc-row__callout-arrow"
                      aria-hidden="true"
                    />
                    <div className="ctbc-row__callout-text">
                      {row.callout.text}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="ctbc__footer">
        <div className="ctbc__ticks" aria-label={`Scale 0 to ${max}`}>
          {ticks.map((t) => (
            <span key={t} className="ctbc__tick">
              {t}
            </span>
          ))}
        </div>
        <div className="ctbc__legend" aria-label="Chart legend">
          {legendItems.map((it) => (
            <div key={it.key} className="ctbc-legend-item">
              <span
                className="ctbc-legend-item__swatch"
                style={{ background: it.color }}
              />
              <span className="ctbc-legend-item__label">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetencyThreeBarChart;
