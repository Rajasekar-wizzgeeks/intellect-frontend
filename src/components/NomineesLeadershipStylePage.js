import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/nomineesLeadershipStylePage.scss";
import AutoPaginatedPptSections from "./AutoPaginatedPptSections";

ChartJS.register(ArcElement, Tooltip);

const Donut = ({ percent, color }) => {
  const pct = Number(percent);
  const safePct = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;

  //   const dottedRingPlugin = {
  //   id: "dottedPattern",

  //   beforeDraw(chart) {
  //     const { ctx } = chart;

  //     const meta = chart.getDatasetMeta(0);
  //     const arc = meta?.data?.[0];

  //     if (!arc) return;

  //     const centerX = arc.x;
  //     const centerY = arc.y;

  //     const innerRadius = arc.innerRadius;
  //     const outerRadius = arc.outerRadius;

  //     const patternCanvas = document.createElement("canvas");
  //     patternCanvas.width = 4;
  //     patternCanvas.height = 4;

  //     const pctx = patternCanvas.getContext("2d");

  //     pctx.fillStyle = color;

  //     pctx.beginPath();
  //     pctx.arc(3, 3, 1, 0, Math.PI * 2);
  //     pctx.fill();

  //     const pattern = ctx.createPattern(patternCanvas, "repeat");

  //     ctx.save();
  //     ctx.fillStyle = pattern;

  //     ctx.beginPath();
  //     ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  //     ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
  //     ctx.closePath();

  //     ctx.fill();
  //     ctx.restore();
  //   },
  // };

  const dottedRingPlugin = {
    id: "dottedPattern",

    beforeDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const arc = meta?.data?.[0];

      if (!arc) return;

      const centerX = arc.x;
      const centerY = arc.y;

      const innerRadius = arc.innerRadius;
      const outerRadius = arc.outerRadius;

      const dotRadius = 1;
      const dotGap = 4;
      const dotColor = color;

      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = dotGap;
      patternCanvas.height = dotGap;

      const pctx = patternCanvas.getContext("2d");

      pctx.fillStyle = dotColor;
      pctx.beginPath();
      pctx.arc(dotGap / 2, dotGap / 2, dotRadius, 0, Math.PI * 2);
      pctx.fill();

      const pattern = ctx.createPattern(patternCanvas, "repeat");

      ctx.save();
      ctx.fillStyle = pattern;

      ctx.beginPath();

      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);

      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);

      ctx.closePath();
      ctx.fill();

      ctx.restore();
    },
  };

  const data = {
    labels: ["Selected", "Remaining"],
    datasets: [
      {
        data: [safePct, 100 - safePct],
        backgroundColor: [color, "rgba(0,0,0,0.06)"],
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "52%",
    rotation: 0,
    circumference: 360,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: false,
  };

  const startAngleDeg = -90;
  const filledAngleDeg = (safePct / 100) * 360;
  const middleAngleDeg = startAngleDeg + filledAngleDeg / 2;
  const angleRad = (middleAngleDeg * Math.PI) / 180;

  const badgeRadiusPx = 60;

  const badgeStyle = {
    // background: color,
    left: `calc(50% + ${badgeRadiusPx * Math.cos(angleRad)}px + 5px)`,
    top: `calc(50% + ${badgeRadiusPx * Math.sin(angleRad) - 5}px - 9px)`,
  };

  return (
    <div className="nls-donut">
      <div className="nls-donut__canvas">
        <Doughnut data={data} options={options} plugins={[dottedRingPlugin]} />
      </div>
      <div className="nls-donut__badge" style={badgeStyle}>
        {Math.round(safePct * 10) / 10}%
      </div>
    </div>
  );
};
const NomineesLeadershipStylePage = ({
  title = "Nominee’s Leadership Style",
  items = [],
  adjectivesTitle = "Description of Workplace Culture - Frequently Mentioned Adjectives",
  adjectivesSubtitle = "(Adjectives that occur more than once)",
  adjectives = [],
  footnote = "* This excludes self feedback ; The larger fonts indicate more number of responses",
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div className="nominee-donut-container">
        <FeedbackCommonHeader
          key="nls-hdr"
          title={title}
          className="nls-header"
        />
        <div key="nls-main" className="nls-main">
          <div className="nls-charts">
            {items?.map((it, idx) => (
              <div key={idx} className="nls-charts__col">
                <Donut percent={it.percent} color={it.color} />
              </div>
            ))}
          </div>

          <div className="nls-pills">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="nls-pill"
                style={{ background: it.pillColor }}
              >
                {it.pillText}
              </div>
            ))}
          </div>
        </div>
      </div>,
    );

    out.push(
      <div key="nls-adj" className="nls-adj">
        <div className="nls-adj__header">
          <div className="nls-adj__title">{adjectivesTitle}</div>
          <div className="nls-adj__subtitle">{adjectivesSubtitle}</div>
          <div className="nls-adj__underline" aria-hidden="true" />
        </div>

        <div className="nls-adj__grid">
          {adjectives?.map((a, idx) => (
            <div
              key={`${a}-${idx}`}
              className={`nls-adj-card nls-adj-card--${idx < 5 ? "lg" : idx < 10 ? "md" : "sm"}`.trim()}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </div>
          ))}
        </div>

        <div className="nls-adj__footnote">{footnote}</div>
      </div>,
    );

    return out;
  }, [adjectives, adjectivesSubtitle, adjectivesTitle, footnote, items, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="nls-page"
      componentId="nominees-leadership-style"
    />
  );
};

export default NomineesLeadershipStylePage;
