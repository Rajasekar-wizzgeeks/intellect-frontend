import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/spiderChartSummary.scss";

const categoriesDefault = [
  "Leadership",
  "Bandwidth",
  "Sales and Customer Centricity",
  "Collaboration",
  "Operational Excellence",
  "Results Orientation",
  "Expertise and Communication",
];

function polarToCartesian(angle, radius) {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return [x, y];
}

function RadarGrid({ cx = 320, cy = 240, R = 135, levels = 5, spokes = 7 }) {
  const step = R / levels;
  const angleStep = (2 * Math.PI) / spokes;

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {Array.from({ length: levels }, (_, i) => {
        const r = step * (i + 1);
        const points = Array.from({ length: spokes }, (_, s) => {
          const a = -Math.PI / 2 + s * angleStep; // start at top
          const [x, y] = polarToCartesian(a, r);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#d9d9d9"
            strokeWidth={1}
          />
        );
      })}
      {Array.from({ length: spokes }, (_, s) => {
        const a = -Math.PI / 2 + s * angleStep;
        const [x, y] = polarToCartesian(a, R);
        return (
          <line
            key={`spoke-${s}`}
            x1={0}
            y1={0}
            x2={x}
            y2={y}
            stroke="#e6e6e6"
            strokeWidth={1}
          />
        );
      })}
    </g>
  );
}

function RadarLevelLabels({ cx = 320, cy = 240, R = 135, levels = 5, max = 5 }) {
  const step = R / levels;

  return (
    <g transform={`translate(${cx}, ${cy})`} fontSize={11} fill="#555">
      {Array.from({ length: levels + 1 }, (_, i) => {
        const v = i;
        const y = -step * v;
        return (
          <text
            key={`lvl-${i}`}
            x={0}
            y={y}
            textAnchor="middle"
            alignmentBaseline="middle"
            dy={i === 0 ? -4 : 0}
          >
            {Math.round((v / levels) * max)}
          </text>
        );
      })}
    </g>
  );
}

function RadarSeries({ cx = 320, cy = 240, R = 135, values = [], max = 5, color = "#0e4a2e" }) {
  const spokes = values.length;
  const angleStep = (2 * Math.PI) / spokes;

  const pathD =
    values
      .map((v, i) => {
        const pct = Math.max(0, Math.min(1, v / max));
        const r = pct * R;
        const a = -Math.PI / 2 + i * angleStep;
        const [x, y] = polarToCartesian(a, r);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ") + " Z";

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} />
    </g>
  );
}

function wrapLabel(text) {
  const cleaned = text.trim();
  if (cleaned.length <= 16) return [cleaned];

  if (/sales/i.test(cleaned) && /customer/i.test(cleaned)) {
    return ["Sales & Customer", "Centricity"];
  }
  if (/expertise/i.test(cleaned) && /communication/i.test(cleaned)) {
    return ["Expertise &", "Communication"];
  }
  if (/operational/i.test(cleaned) && /excellence/i.test(cleaned)) {
    return ["Operational", "Excellence"];
  }
  if (/results/i.test(cleaned) && /orientation/i.test(cleaned)) {
    return ["Results", "Orientation"];
  }

  const conjMatch = cleaned.match(/^(.*?)\s+(?:and|&)\s+(.+)$/i);
  if (conjMatch) {
    return [`${conjMatch[1]} &`, conjMatch[2]];
  }

  const spaceIdx = cleaned.lastIndexOf(" ", 18);
  if (spaceIdx > 0) {
    return [cleaned.slice(0, spaceIdx), cleaned.slice(spaceIdx + 1)];
  }
  return [cleaned];
}

function RadarLabels({ cx = 320, cy = 240, R = 135, labels = [] }) {
  const angleStep = (2 * Math.PI) / labels.length;
  const labelRadius = R + 22;

  return (
    <g transform={`translate(${cx}, ${cy})`} fontSize={13} fill="#1e293b" fontWeight="600">
      {labels.map((lab, i) => {
        const a = -Math.PI / 2 + i * angleStep;
        const [x, y] = polarToCartesian(a, labelRadius);

        const cosA = Math.cos(a);
        const anchor =
          Math.abs(cosA) < 0.25
            ? "middle"
            : cosA > 0
            ? "start"
            : "end";

        const lines = wrapLabel(lab);
        const lineHeight = 16;
        const startY = lines.length > 1 ? y - ((lines.length - 1) * lineHeight) / 2 : y;

        return (
          <text
            key={i}
            x={x}
            y={startY}
            textAnchor={anchor}
            alignmentBaseline="middle"
          >
            {lines.map((line, li) => (
              <tspan key={li} x={x} dy={li === 0 ? 0 : lineHeight}>
                {line}
              </tspan>
            ))}
          </text>
        );
      })}
    </g>
  );
}

const Legend = () => (
  <div className="scs-legend">
    <div className="scs-legend__title">Legend</div>
    {[
      { label: "Self", color: "var(--surface-clay)" },
      { label: "Manager", color: "var(--color-green)" },
      { label: "Others", color: "var(--color-gold)" },
    ].map((it) => (
      <div key={it.label} className="scs-legend__item">
        <span className="scs-legend__color" style={{ background: it.color }} />
        <span className="scs-legend__label">{it.label}</span>
      </div>
    ))}
  </div>
);

const SpiderChartSummary = ({
  startPage = 14,
  pageWidth = 794,
  pageHeight = 1123,
  pagePadding = 10,
  categories = categoriesDefault,
  self = [4.0, 3.0, 3.5, 2.0, 3.0, 3.5, 3.1],
  manager = [4.5, 3.8, 4.0, 3.0, 3.0, 4.0, 4.0],
  others = [4.2, 4.0, 4.1, 4.0, 3.0, 4.0, 3.8],
}) => {
  const width = 640;
  const height = 480;
  const cx = 320;
  const cy = 240;
  const R = 135;

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title scs-title">
        <span className="content-page__title-index">2.3.</span>
        <span className="content-page__title-text">
          LBSCORE Element Summary – Spider Chart
        </span>
      </h2>
    );

    out.push(
      <div key="desc" className="scs-desc">
        <p className="scs-desc__text">
          The spider chart below plots each of the seven LBSCORE elements —
          Leadership, Bandwidth, Sales & Customer Centricity, Collaboration,
          Operational Excellence, Results Orientation, and Expertise &
          Communication — along separate spokes. For every spoke you'll see a
          coloured line for each rater group - Self, Manager(s), and Others
          [Team Member(s) and Peer(s)].
        </p>
        <ol className="scs-desc__list">
          <li className="scs-desc__item">
            <strong>Quick-gap spotting:</strong> Diverging shapes make it easy
            to see where your own view or one rater group's perception differs
            from the rest.
          </li>
          <li className="scs-desc__item scs-desc__item--mt10">
            <strong>Score direction:</strong> Points closer to the outer rim
            indicate more consistent demonstration of the behaviour; points
            nearer the hub show less frequent or less visible practice.
          </li>
          <li className="scs-desc__item scs-desc__item--mt10">
            <strong>Action cues:</strong> Look for spokes where the lines pull
            inward or spread widely apart — these highlight the priority gaps to
            address in your development plan.
          </li>
        </ol>
      </div>
    );

    out.push(
      <div key="chartwrap" className="scs-chartwrap">
        <div className="scs-chartwrap__center">
          <svg
            className="scs-chart"
            width={width}
            height={height}
            role="img"
            aria-label="LBSCORE spider chart"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <RadarGrid cx={cx} cy={cy} R={R} levels={5} spokes={categories.length} />
            <RadarLevelLabels cx={cx} cy={cy} R={R} levels={5} max={5} />
            <RadarLabels cx={cx} cy={cy} R={R} labels={categories} />
            <RadarSeries cx={cx} cy={cy} R={R} values={self} color="#caa785" />
            <RadarSeries cx={cx} cy={cy} R={R} values={manager} color="#0e4a2e" />
            <RadarSeries cx={cx} cy={cy} R={R} values={others} color="#b8860b" />
          </svg>
          <Legend />
        </div>
      </div>
    );

    return out;
  }, [categories, self, manager, others]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // paddingLeft={40}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default SpiderChartSummary;
