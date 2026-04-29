import React, { useMemo } from "react";
import "../styles/competencyRangeChart.scss";

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const CompetencyRangeChart = ({ items = [], minX = 1, maxX = 5 }) => {
  const ticks = useMemo(() => {
    const out = [];
    for (let v = minX; v <= maxX; v += 0.25) out.push(Number(v.toFixed(2)));
    return out;
  }, [minX, maxX]);

  const xPct = (value) => {
    const v = Number(value);
    if (!Number.isFinite(v)) return 0;
    return clamp01((v - minX) / (maxX - minX)) * 100;
  };

  return (
    <div className="crc">
      <div className="crc__legend">
        <div className="crc__legend-item">
          <span className="crc__legend-line" />
          <span>Group Min &amp; Max Range</span>
        </div>
        <div className="crc__legend-item">
          <span className="crc__legend-mean" />
          <span>Average Ratings for each competency</span>
        </div>
      </div>

      <div className="crc__grid">
        {items.map((it, idx) => (
          <div key={it.label || idx} className="crc__row">
            <div className="crc__label">{it.label}</div>

            <div className="crc__plot">
              <div className="crc__plot-bg">
                {ticks.map((t) => (
                  <div key={t} className="crc__tick" />
                ))}
              </div>

              <div
                className="crc__range"
                style={{
                  left: `${xPct(it.min)}%`,
                  width: `${Math.max(0, xPct(it.max) - xPct(it.min))}%`,
                }}
              />

              <div className="crc__mean" style={{ left: `${xPct(it.mean)}%` }} />

              <div className="crc__min-label" style={{ left: `${xPct(it.min)}%` }}>
                {Number(it.min).toFixed(2).replace(/\.00$/, "")}
              </div>
              <div className="crc__mean-label" style={{ left: `${xPct(it.mean)}%` }}>
                {Number(it.mean).toFixed(2).replace(/\.00$/, "")}
              </div>
              <div className="crc__max-label" style={{ left: `${xPct(it.max)}%` }}>
                {Number(it.max).toFixed(2).replace(/\.00$/, "")}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="crc__axis">
        {Array.from({ length: (maxX - minX) * 4 + 1 }, (_, i) => minX + i * 0.25)
          .filter((v) => Number.isFinite(v))
          .map((v) => (
            <div key={v} className={`crc__axis-tick ${Number.isInteger(v) ? "crc__axis-tick--major" : ""}`}>
              {Number.isInteger(v) ? v : ""}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CompetencyRangeChart;
