import React, { useCallback, useMemo, useState,useEffect } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/highlights.scss";
import ArcConnector from "./ArcConnector";

const ChessIcon = ({ size = 120, color = "#0e4a2e" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill={color}>
      <path d="M46 16h36v8H46zM40 32h48v10H40zM36 50h56v14H36z" opacity="0.9" />
      <path d="M32 72h64v28H32z" opacity="0.9" />
      <path d="M24 102h80v14H24z" />
    </g>
  </svg>
);

const ScoreChip = ({ score = 2.5, color = "#c0943a", scoreShip = false, onChange, onBlur }) => (
  <div className="hl-chip">
    {onChange ? (
      <input
        type="text"
        className="hl-chip-input"
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

const LeftIcon = ({ leftIcon, arcColor }) => {
  if (!leftIcon) return null;
  if (typeof leftIcon === "string") {
    return <img src={leftIcon} alt="left" className="hl-left-img" />;
  }
  return leftIcon;
};

const HighlightRow = ({ 
  item, 
  index, 
  points, 
  rowTopAdjust, 
  chipColor, 
  scoreShip, 
  onItemChange 
}) => {
  const [localTitle, setLocalTitle] = useState(item.title ?? "");
  const [localDesc, setLocalDesc] = useState(item.desc ?? "");
  const [localScore, setLocalScore] = useState(item.score ?? "");

  useEffect(() => {
    setLocalTitle(item.title ?? "");
    setLocalDesc(item.desc ?? "");
    setLocalScore(item.score ?? "");
  }, [item]);

  const handleBlur = () => {
    if (
      localTitle !== item.title ||
      localDesc !== item.desc ||
      localScore !== item.score
    ) {
      onItemChange(index, {
        ...item,
        title: localTitle,
        desc: localDesc,
        score: localScore,
      });
    }
  };

  if (!points[index]) return null;

  return (
    <div
      className="hl-row"
      style={{
        position: "absolute",
        top: points[index].y - rowTopAdjust,
        width: "100%",
      }}
    >
      <div
        className="hl-row-line"
        style={{
          width: 200 - points[index].x,
          left: -(200 - points[index].x),
        }}
      />
      <ScoreChip
        score={localScore}
        color={chipColor}
        scoreShip={scoreShip}
        onChange={(val) => setLocalScore(val)}
        onBlur={handleBlur}
      />
      <div className="hl-row-text">
        <div className="hl-row-title">
          <input
            className="hl-row-title-input"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleBlur}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              font: "inherit",
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </div>
        <div className="hl-row-desc">
          <textarea
            className="hl-row-desc-input"
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
      </div>
    </div>
  );
};

const Highlights = ({
  startPage = 45,
  pageWidth = 794,
  pageHeight = 802,
  pagePadding = 10,
  titleIndex = "",
  titleText = "",
  subIndex = "4.1.",
  subText = "Strengths",
  note = "Below are the top 5 statements where you received the highest ratings and are considered your key strengths.",
  arcColor = "var(--color-gold)",
  chipColor = "var(--color-gold)",
  dotsColor = "var(--color-gold)",
  leftIcon = null,
  scoreShip = false,
  items = [],
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
    const minRowSpacing = 50;
    const topOffset = 50;
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
    const rowTopAdjust = 39;

    // Title
    if (titleIndex && titleText) {
      out.push(
        <h2 key="title" className="content-page__title hl-title">
          <span className="content-page__title-index">{titleIndex}</span>
          <span className="content-page__title-text">{titleText}</span>
        </h2>
      );
    }

    out.push(
      <h3 key="subtitle" className="content-page__subtitle hl-subtitle">
        <span className="hl-subtitle__index">{subIndex}</span>
        <span>{subText}</span>
      </h3>
    );

    out.push(
      <div key="note" className="hl-note">
        <em className="hl-note__em">{note}</em>
      </div>
    )

    out.push(
      <div
        key="grid"
        className="hl-grid"
        style={{
          "--arc-color": arcColor,
          "--chip-color": chipColor,
          // height:950,
        
        }}
      >
        <div className="hl-left" style={{ minHeight: arcHeight }}>
          <ArcConnector
            items={localItems}
            arcColor={arcColor}
            arcHeight={arcHeight}
            paddingTop={paddingTop}
            paddingBottom={paddingBottom}
            setPointsLine={handlePointsLine}
          />
          {leftIcon && (
            <div className="hl-chess">
              <LeftIcon leftIcon={leftIcon} arcColor={arcColor} />
            </div>
          )}
        </div>
        <div className="hl-right" style={{ position: "relative", width: "100%" }}>
          {points.length === localItems.length &&
            localItems.map((it, i) => (
              <HighlightRow
                key={`it-${i}`}
                item={it}
                index={i}
                points={points}
                rowTopAdjust={rowTopAdjust}
                chipColor={chipColor}
                scoreShip={scoreShip}
                onItemChange={handleItemUpdate}
              />
            ))}
        </div>
      </div>
    );

    return out;
  }, [
    titleIndex,
    titleText,
    subIndex,
    subText,
    note,
    localItems,
    arcColor,
    chipColor,
    dotsColor,
    leftIcon,
    points,
    handlePointsLine,
    handleItemUpdate,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default Highlights;
