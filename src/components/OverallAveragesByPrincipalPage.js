import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/overallAveragesByPrincipalPage.scss";

const BarList = ({ title, colorClass, rows = [] }) => {
  const max = useMemo(() => {
    const vals = rows.map((r) => Number(r.value)).filter((v) => Number.isFinite(v));
    return vals.length ? Math.max(...vals, 5) : 5;
  }, [rows]);

  return (
    <div className={`oap-col oap-col--${colorClass}`.trim()}>
      <div className="oap-col__title">{title}</div>

      <div className="oap-col__legend">
        <span className={`oap-col__legend-dot oap-col__legend-dot--${colorClass}`} />
        <span className="oap-col__legend-text">{title === "Team" ? "Group Mean (Teachers & Office Staff)" : "Manager Rating"}</span>
      </div>

      <div className="oap-rows">
        {rows.map((r, idx) => {
          const v = Number(r.value);
          const pct = Number.isFinite(v) ? Math.max(0, Math.min(100, (v / max) * 100)) : 0;
          return (
            <div key={r.name || idx} className="oap-row">
              <div className="oap-row__name">{r.name}</div>
              <div className="oap-row__bar-wrap">
                {r.responses != null ? (
                  <div className="oap-row__responses">{r.responses} responses</div>
                ) : null}
                <div className={`oap-row__bar oap-row__bar--${colorClass}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="oap-row__value">{Number.isFinite(v) ? v.toFixed(2).replace(/\.00$/, "") : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OverallAveragesByPrincipalPage = ({
  title = "Overall Averages By Principal",
  teamRows = [],
  managerRows = [],
}) => {
  const blocks = useMemo(() => {
    return [
      <div key="oap" className="oap-page">
        <FeedbackCommonHeader title={title} titleWidth={100} />
        <div className="oap-page__grid">
          <BarList title="Team" colorClass="team" rows={teamRows} />
          <div className="oap-page__divider" aria-hidden="true" />
          <BarList title="Manager" colorClass="manager" rows={managerRows} />
        </div>
      </div>,
    ];
  }, [managerRows, teamRows, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="overall-averages-by-principal-page"
      componentId="overall-averages-by-principal"
    />
  );
};

export default OverallAveragesByPrincipalPage;
