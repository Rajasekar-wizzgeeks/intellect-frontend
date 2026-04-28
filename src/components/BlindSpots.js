import React, { useCallback, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/blindSpots.scss";
import ArcConnector from "./ArcConnector";

const ScoreChip = ({ score = 2.5, scoreShip = false }) => (
  <div className="bs-chip">{<span>{score}</span>}</div>
);

const LeftIcon = ({ leftIcon }) => {
  if (!leftIcon) return null;
  if (typeof leftIcon === "string")
    return <img src={leftIcon} alt="left" className="bs-left-img" />;
  return leftIcon;
};

const RatingBars = ({ self = 4, others = 2 }) => {
  const max = 5;
  const selfPct = Math.max(0, Math.min(100, (self / max) * 100));
  const othersPct = Math.max(0, Math.min(100, (others / max) * 100));
  const colorPicker = [
    "var(--color-warm-sand)",
    "var(--color-copper)",
    "var(--color-mint)",
    "var(--color-mint)",
    "var(--color-green)",
  ];
  return (
    <div className="bs-bars-row">
      {/* Left: Others green bar with centered value */}
      <div className="bs-left-others">
        <div className="bs-bar others">
          <div
            className="bs-fill others"
            style={{ width: `${selfPct}%`, background: colorPicker[self - 1] }}
          />
          <span className="bs-value others">{self}</span>
        </div>
      </div>
      <span className="bs-center-label">Others</span>
      <div className="bs-bar others">
        <div
          className="bs-fill others"
          style={{
            width: `${othersPct}%`,
            background: colorPicker[others - 1],
          }}
        />
        <span className="bs-value others">{others}</span>-{" "}
      </div>
    </div>
  );
};

const BlindSpots = ({
  startPage = 48,
  titleIndex = "4.4.",
  titleText = "Blind Spots",
  description = " are behaviours/ competencies where you have rated yourself higher than others with a difference of ≥ 0.5 between your self-rating and the rating given by others. These are highlighted only when self-rating is ≥3.5, indicating areas where you may be overestimating your effectiveness compared to how others experience you. Only the top 5 statements with the largest rating gaps are indicated.",
  arcColor = "var(--color-gold)",
  chipColor = "var(--color-gold)",
  leftIcon = null,
  scoreShip = false,
  items = [],
  key_id = "",
}) => {
  const [points, setPoints] = useState([]);

  const stripLeadingSerial = (text) => {
    const s = String(text ?? "").trim();
    return s.replace(/^\d+\s*[.)-]\s*/, "");
  };

  const arePointsEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.x !== b[i]?.x || a[i]?.y !== b[i]?.y) return false;
    }
    return true;
  };

  const handlePointsLine = useCallback((newPoints) => {
    setPoints((prev) => {
      if (arePointsEqual(prev, newPoints)) return prev;
      return newPoints;
    });
  }, []);

  const blocks = useMemo(() => {
    const out = [];
    const baseRowSpacing = 100;
    const minRowSpacing = 60;
    const topOffset = 70;
    const maxArcHeight = 680;

    let rowSpacing = baseRowSpacing;
    if (items.length > 1) {
      const idealHeight = topOffset * 2 + (items.length - 1) * baseRowSpacing + 160;
      if (idealHeight > maxArcHeight) {
        const availableForRows = maxArcHeight - topOffset * 2 - 160;
        rowSpacing = Math.max(
          minRowSpacing,
          availableForRows / (items.length - 1)
        );
      }
    }

    const arcHeight = topOffset * 2 + (items.length - 1) * rowSpacing + 160;
    const paddingTop = topOffset;
    const paddingBottom = topOffset;

    out.push(
      <h2 key="title" className="content-page__title bs-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>,
    );

    out.push(
      <div key="desc" className="bs-desc">
        <p>
          <strong>{titleText}</strong> {description}
        </p>
      </div>,
    );

    out.push(
      <div
        key="grid"
        className="bs-grid"
        style={{ "--bs-arc": arcColor, "--bs-chip": chipColor }}
      >
        <div className="bs-left" style={{ minHeight: arcHeight }}>
          {/* <svg
            className="bs-arc"
            viewBox={`0 0 200 ${arcHeight}`}
            preserveAspectRatio="none"
          >
            <path
              d={`M20 0 C 160 ${Math.round(arcHeight * 0.23)}, 160 ${Math.round(
                arcHeight * 0.77
              )}, 20 ${arcHeight}`}
              stroke={arcColor}
              strokeWidth="3.0"
              fill="none"
              strokeLinecap="round"
            />
            {items.map((it, i) => (
              <circle
                key={i}
                cx={
                  i == 0 || i == items.length - 1 ? 65 : i == 1 ? 110 : i == 2 ? 124 : i == 3 ? 110 : 65
                }
                cy={topOffset + i * rowSpacing + i * 40}
                r={8}
                fill={arcColor}
              />
            ))}
          </svg> */}
          <ArcConnector
            items={items}
            arcColor={arcColor}
            arcHeight={arcHeight}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            setPointsLine={handlePointsLine}
          />

          {leftIcon && (
            <div className="bs-left-icon">
              <div className="bs-left-icon-card">
                <LeftIcon leftIcon={leftIcon} />
              </div>
            </div>
          )}
        </div>
        <div
          className="bs-right"
          style={{ position: "relative", width: "100%" }}
        >
          {points.length === items.length &&
            items.map((it, i) => (
              <div
                key={`row-${i}`}
                className="bs-row"
                style={{
                  position: "absolute",
                  top: points[i].y - 45,
                  width: "100%",
                }}
              >
                <div
                  className="bs-connector"
                  style={{
                    width: 200 - points[i].x,
                    left: -(200 - points[i].x),
                  }}
                />
                <ScoreChip score={it.score} scoreShip={scoreShip} />
                <div className="bs-row-main">
                  <div className="bs-row-top">
                    <div className="bs-row-title">Your Rating</div>
                    <RatingBars self={it.self} others={it.others} />
                  </div>
                  <div className="bs-row-text">{stripLeadingSerial(it.text)}</div>
                </div>
              </div>
            ))}
        </div>
      </div>,
    );

    return out;
  }, [
    titleIndex,
    titleText,
    description,
    items,
    points,
    arcColor,
    chipColor,
    leftIcon,
    handlePointsLine,
  ]);

  return (
    <AutoPaginatedSections
      startPage={startPage}
      blocks={blocks}
      pageHeight={1000}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default BlindSpots;
