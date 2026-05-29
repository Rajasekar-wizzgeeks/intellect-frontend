import React, { useCallback, useMemo, useState,useEffect } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/blindSpots.scss";
import ArcConnector from "./ArcConnector";

const ScoreChip = ({ score = 2.5, scoreShip = false, onChange, onBlur }) => (
  <div className="bs-chip">
    {onChange ? (
      <input
        type="text"
        className="bs-chip-input"
        value={score}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        style={{
          width: "40px",
          background: "transparent",
          border: "none",
          color: "inherit",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "inherit",
        }}
      />
    ) : (
      <span>{score}</span>
    )}
  </div>
);

const LeftIcon = ({ leftIcon }) => {
  if (!leftIcon) return null;
  if (typeof leftIcon === "string")
    return <img src={leftIcon} alt="left" className="bs-left-img" />;
  return leftIcon;
};

const RatingBars = ({ self = 4, others = 2, onSelfChange, onOthersChange, onBlur }) => {
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
            style={{ width: `${selfPct}%`, background: colorPicker[Math.max(0, Math.floor(self - 1))] }}
          />
          {onSelfChange ? (
            <input
              type="number"
              className="bs-value-input others"
              value={self}
              step="0.1"
              onChange={(e) => onSelfChange(e.target.value)}
              onBlur={onBlur}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "40px",
                border: "none",
                background: "transparent",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
              }}
            />
          ) : (
            <span className="bs-value others">{self}</span>
          )}
        </div>
      </div>
      <span className="bs-center-label">Others</span>
      <div className="bs-bar others">
        <div
          className="bs-fill others"
          style={{
            width: `${othersPct}%`,
            background: colorPicker[Math.max(0, Math.floor(others - 1))],
          }}
        />
        {onOthersChange ? (
          <input
            type="number"
            className="bs-value-input others"
            value={others}
            step="0.1"
            onChange={(e) => onOthersChange(e.target.value)}
            onBlur={onBlur}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "40px",
              border: "none",
              background: "transparent",
              color: "#fff",
              textAlign: "center",
              fontWeight: "bold",
            }}
          />
        ) : (
          <span className="bs-value others">{others}</span>
        )}
      </div>
    </div>
  );
};

const BlindSpotRow = ({
  item,
  index,
  points,
  chipColor,
  scoreShip,
  onItemChange
}) => {
  const [localDesc, setLocalDesc] = useState(item.desc ?? "");
  const [localScore, setLocalScore] = useState(item.score ?? "");
  const [localSelf, setLocalSelf] = useState(item.self ?? 0);
  const [localOthers, setLocalOthers] = useState(item.others ?? 0);

  useEffect(() => {
    setLocalDesc(item.desc ?? "");
    setLocalScore(item.score ?? "");
    setLocalSelf(item.self ?? 0);
    setLocalOthers(item.others ?? 0);
  }, [item]);

  const handleBlur = () => {
    if (
      localDesc !== item.desc ||
      localScore !== item.score ||
      localSelf !== item.self ||
      localOthers !== item.others
    ) {
      onItemChange(index, {
        ...item,
        desc: localDesc,
        score: localScore,
        self: localSelf,
        others: localOthers
      });
    }
  };

  if (!points[index]) return null;

  return (
    <div
      className="bs-row"
      style={{
        position: "absolute",
        top: points[index].y - 45,
        width: "100%",
      }}
    >
      <div
        className="bs-connector"
        style={{
          width: 200 - points[index].x,
          left: -(200 - points[index].x),
        }}
      />
      <ScoreChip
        score={localScore}
        scoreShip={scoreShip}
        onChange={(val) => setLocalScore(val)}
        onBlur={handleBlur}
      />
      <div className="bs-row-content">
        <div className="bs-row-text">
          <textarea
            className="bs-row-text-input"
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={handleBlur}
            rows={2}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              font: "inherit",
              color: "inherit",
              resize: "none",
            }}
          />
        </div>
        <RatingBars
          self={localSelf}
          others={localOthers}
          onSelfChange={(val) => setLocalSelf(val)}
          onOthersChange={(val) => setLocalOthers(val)}
          onBlur={handleBlur}
        />
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
  onDataChange,
}) => {
  const [points, setPoints] = useState([]);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleItemUpdate = useCallback((idx, nextItem) => {
    const nextItems = [...localItems];
    nextItems[idx] = nextItem;
    setLocalItems(nextItems);
    if (onDataChange) {
      onDataChange(nextItems);
    }
  }, [localItems, onDataChange]);

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
    if (localItems.length > 1) {
      const idealHeight = topOffset * 2 + (localItems.length - 1) * baseRowSpacing + 160;
      if (idealHeight > maxArcHeight) {
        const availableForRows = maxArcHeight - topOffset * 2 - 160;
        rowSpacing = Math.max(
          minRowSpacing,
          availableForRows / (localItems.length - 1)
        );
      }
    }

    const arcHeight = topOffset * 2 + (localItems.length - 1) * rowSpacing + 160;
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
          <ArcConnector
            items={localItems}
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
          {points.length === localItems.length &&
            localItems.map((it, i) => (
              <BlindSpotRow
                key={`row-${i}`}
                item={it}
                index={i}
                points={points}
                chipColor={chipColor}
                scoreShip={scoreShip}
                onItemChange={handleItemUpdate}
              />
            ))}
        </div>
      </div>,
    );

    return out;
  }, [
    titleIndex,
    titleText,
    description,
    localItems,
    points,
    arcColor,
    chipColor,
    leftIcon,
    handlePointsLine,
    handleItemUpdate,
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
