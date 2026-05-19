import "../styles/competencyRangeChart.scss";

const X_MIN = 1;
const X_MAX = 5;
const PLOT_LEFT = 305; 

const ticks = [
  1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3,
  3.25, 3.5, 3.75, 4, 4.25, 4.5, 4.75, 5,
];

const rows = [
  { label: "Educational Quality & Student Outcomes", min: 4.21, avg: 4.37, max: 4.64 },
  { label: "Leadership for Staff Performance & Development", min: 4.14, avg: 4.34, max: 4.64 },
  { label: "Leadership Personality & Style", min: 3.88, avg: 4.26, max: 4.7 },
  { label: "Creating the Right Culture", min: 3.84, avg: 4.24, max: 4.54 },
  {
    label: "Engagement with Management",
    sub: "(Rated only by the Manager)",
    min: 3,
    avg: 3.93,
    max: 4.67,
  },
];

const CompetencyChart = ({ items, minX = X_MIN, maxX = X_MAX, showTitle = true }) => {
  const activeRows = Array.isArray(items) && items.length > 0 ? items : rows;
  const rowHeight = 100 / activeRows.length;

  const pct = (v) => ((v - minX) / (maxX - minX)) * 100;

  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

  const leftStyle = (v) =>
    `calc(${PLOT_LEFT}px + (100% - ${PLOT_LEFT}px) * ${pct(v) / 100})`;

  return (
    <div className="cc">
      {showTitle ? (
        <>
          <h2 className="cc__title">Summary by Competency for the Institution</h2>
          <div className="cc__title-rule" />
        </>
      ) : null}

      <div className="cc__legend">
        <div className="cc__legend-item">
          <span className="cc__legend-line" />
          <span>Group Min &amp; Max Range</span>
        </div>
        <div className="cc__legend-item">
          <span className="cc__legend-square" />
          <span>Average Ratings for each competency</span>
        </div>
      </div>

      <div className="cc__plot">
        {activeRows.map((r, i) => {
          const top = `${i * rowHeight}%`;
          const height = `${rowHeight}%`;
          const rangeLeft = leftStyle(r.min);
          const rangeWidth = `calc((100% - ${PLOT_LEFT}px) * ${(pct(r.max) - pct(r.min)) / 100})`;

          return (
            <div key={r.label} className="cc__row" style={{ top, height }}>
              <div className="cc__label">
                {r.label}
                {r.sub && <span className="cc__label-sub">{r.sub}</span>}
              </div>

              <div
                className="cc__arrow"
                style={{
                  width: `calc(${leftStyle(r.min)} - ${PLOT_LEFT}px - 4px)`,
                }}
              />

              <div className="cc__range" style={{ left: rangeLeft, width: rangeWidth }} />
              <div className="cc__dot" style={{ left: leftStyle(r.avg) }} />

              <span className="cc__num" style={{ left: leftStyle(r.min) }}>
                {fmt(r.min)}
              </span>
              <span className="cc__num cc__num--red" style={{ left: leftStyle(r.avg) }}>
                {r.avg.toFixed(2)}
              </span>
              <span className="cc__num" style={{ left: leftStyle(r.max) }}>
                {fmt(r.max)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="cc__x-axis">
        {ticks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className="cc__footer">
        *Excludes Self ratings for calculation of min, max and average
      </div>
      <span className="cc__page-num">4</span>
    </div>
  );
};

export default CompetencyChart;
