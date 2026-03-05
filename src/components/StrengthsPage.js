import React, { useCallback, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import ArcConnector from "./ArcConnector";
import strengthImage from "../assets/png/strengthImage.png";
import "../styles/strengthsPage.scss";

const StrengthsPage = ({
  startPage = 4,
  title = "Strengths",
  groupTitle = "Group Mean – Teachers and Office Staff",
  groupSubTitle = "(Ratings > 4.5 Only)",
  managerTitle = "Manager Rating",
  managerSubTitle = "(Ratings > 4 Only)",
  arcColor = "var(--color-green-mid)",
  improvementsTitle = "Areas of Improvement",
  improvementsGroupTitle = "Group Mean – Teachers and Office Staff",
  improvementsGroupSubTitle = "(Ratings < 4.5 Only)",
  improvementsManagerTitle = "Manager Rating",
  improvementsManagerSubTitle = "(Ratings < 4 Only)",
  groupItems = [],
  managerItems = [],
  improvementsGroupItems = [],
  improvementsManagerItems = [],
  averageCompentency = {},
}) => {
  const [strengthPoints, setStrengthPoints] = useState([]);
  const [improvementPoints, setImprovementPoints] = useState([]);

  const derivedFromAverage = useMemo(() => {
    if (!averageCompentency || typeof averageCompentency !== "object") {
      return null;
    }

    const groupStrengths = [];
    const groupImprovements = [];
    const managerStrengths = [];
    const managerImprovements = [];

    Object.values(averageCompentency).forEach((rows) => {
      if (!Array.isArray(rows)) return;

      rows.forEach((row) => {
        const label = row?.label;
        if (!label) return;

        const g = Number(row?.groupMean);
        if (Number.isFinite(g)) {
          if (g > 4.5) {
            groupStrengths.push({ score: g, text: label });
          } else if (g > 0 && g < 4.5) {
            groupImprovements.push({ score: g, text: label });
          }
        }

        const m = Number(row?.managerRating);
        if (Number.isFinite(m)) {
          if (m > 4) {
            managerStrengths.push({ score: m, text: label });
          } else if (m > 0 && m < 4) {
            managerImprovements.push({ score: m, text: label });
          }
        }
      });
    });

    groupStrengths.sort((a, b) => b.score - a.score);
    groupImprovements.sort((a, b) => a.score - b.score);
    managerStrengths.sort((a, b) => b.score - a.score);
    managerImprovements.sort((a, b) => a.score - b.score);

    return {
      groupStrengths: groupStrengths.slice(0, 3),
      groupImprovements: groupImprovements.slice(0, 3),
      managerStrengths: managerStrengths.slice(0, 3),
      managerImprovements: managerImprovements.slice(0, 3),
    };
  }, [averageCompentency]);

  const effectiveGroupItems = derivedFromAverage?.groupStrengths?.length
    ? derivedFromAverage.groupStrengths
    : groupItems;

  const effectiveImprovementsGroupItems = derivedFromAverage?.groupImprovements
    ?.length
    ? derivedFromAverage.groupImprovements
    : improvementsGroupItems;

  const effectiveManagerItems = derivedFromAverage?.managerStrengths?.length
    ? derivedFromAverage.managerStrengths
    : managerItems;

  const effectiveImprovementsManagerItems = derivedFromAverage
    ?.managerImprovements?.length
    ? derivedFromAverage.managerImprovements
    : improvementsManagerItems;

  const arePointsEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.x !== b[i]?.x || a[i]?.y !== b[i]?.y) return false;
    }
    return true;
  };

  const handleStrengthPointsLine = useCallback((newPoints) => {
    setStrengthPoints((prev) => {
      if (arePointsEqual(prev, newPoints)) return prev;
      return newPoints;
    });
  }, []);

  const handleImprovementPointsLine = useCallback((newPoints) => {
    setImprovementPoints((prev) => {
      if (arePointsEqual(prev, newPoints)) return prev;
      return newPoints;
    });
  }, []);

  const blocks = useMemo(() => {
    const out = [];

    const topOffset = 85;
    const arcHeight = 450;
    const paddingTop = topOffset;
    const paddingBottom = topOffset;

    out.push(
      <div key="strengths" className="sp sp-strengths">
        <FeedbackCommonHeader title={title} />

        <div className="sp-grid" style={{ "--sp-arc-color": arcColor }}>
          <div className="sp-left">
            <ArcConnector
              items={effectiveGroupItems}
              arcColor={"var(--strength-arc-color)"}
              arcHeight={arcHeight}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              setPointsLine={handleStrengthPointsLine}
              circleColor={"var(--strength-pill-bg)"}
              circleBorderColor={"var(--strength-arc-color)"}
              strokeWidth={6}
              circleRadius={10}
            />
            <div className="sp-left__icon" aria-hidden="true">
              <img src={strengthImage} alt="" className="sp-left__img" />
            </div>
          </div>

          <div className="sp-right">
            <div className="sp-cols">
              <div className="sp-col">
                <div className="sp-col__header">
                  <div className="sp-col__header-title">{groupTitle}</div>
                </div>
                <div className="sp-col__header-sub">{groupSubTitle}</div>

                <div className="sp-col__body" style={{ height: 330 }}>
                  {strengthPoints.length === effectiveGroupItems.length &&
                    effectiveGroupItems.map((it, i) => (
                      <div
                        key={`g-${i}`}
                        className="sp-row"
                        style={{
                          top:
                            // strengthPoints[i].y - rowTopAdjust
                            i === 0 ? 22 : i === 1 ? 122 : 223,
                        }}
                      >
                        <div
                          className="sp-row__line"
                          style={{
                            top: 31,
                            width: Math.min(160 - strengthPoints[i].x, 50),
                            left: i === 1 ? -35 : -(155 - strengthPoints[i].x),
                          }}
                        />
                        <div className="sp-pill">
                          {Number(it.score).toFixed(2)}
                        </div>
                        <div className="sp-card">{it.text}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="sp-divider" aria-hidden="true" />

              <div className="sp-col">
                <div className="sp-col__header sp-col__header--manager">
                  <div className="sp-col__header-title">{managerTitle}</div>
                </div>
                <div className="sp-col__header-sub">{managerSubTitle}</div>

                <div className="sp-col__body sp-col__body--manager">
                  {effectiveManagerItems.map((it, idx) => (
                    <div
                      key={`m-${idx}`}
                      className="sp-row sp-row--manager"
                      style={{
                        position: "absolute",
                        top: idx === 0 ? 22 : idx === 1 ? 122 : 223,
                      }}
                    >
                      <div className="sp-pill">
                        {Number(it.score).toFixed(2)}
                      </div>
                      <div className="sp-card">{it.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
    );

    out.push(
      <div key="improvements" className="sp sp--improvement">
        <FeedbackCommonHeader title={improvementsTitle} />

        <div
          className="sp-grid"
          style={{
            "--sp-arc-color": "var(--feedback-initial-underline-color)",
          }}
        >
          <div className="sp-left">
            <ArcConnector
              items={effectiveImprovementsGroupItems}
              arcColor={"#b33737"}
              arcHeight={arcHeight}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              setPointsLine={handleImprovementPointsLine}
              circleColor={"var(--improve-pill-bg"}
              circleBorderColor={"#b33737"}
              strokeWidth={6}
              circleRadius={10}
            />
            <div className="sp-left__icon" aria-hidden="true">
              <img src={strengthImage} alt="" className="sp-left__img" />
            </div>
          </div>

          <div className="sp-right">
            <div className="sp-cols">
              <div className="sp-col">
                <div className="sp-col__header">
                  <div className="sp-col__header-title">
                    {improvementsGroupTitle}
                  </div>
                </div>
                <div className="sp-col__header-sub">
                  {improvementsGroupSubTitle}
                </div>

                <div className="sp-col__body" style={{ height: 330 }}>
                  {improvementPoints.length ===
                    effectiveImprovementsGroupItems.length &&
                    effectiveImprovementsGroupItems.map((it, i) => (
                      <div
                        key={`ig-${i}`}
                        className="sp-row"
                        style={{
                          top: i === 0 ? 22 : i === 1 ? 122 : 223,
                        }}
                      >
                        <div
                          className="sp-row__line"
                          style={{
                            top: 31,
                            width: Math.min(160 - improvementPoints[i].x, 50),
                            left:
                              i === 1 ? -35 : -(155 - improvementPoints[i].x),
                          }}
                        />
                        <div className="sp-pill">
                          {Number(it.score).toFixed(2)}
                        </div>
                        <div className="sp-card"> {it.text}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="sp-divider" aria-hidden="true" />

              <div className="sp-col">
                <div className="sp-col__header sp-col__header--manager">
                  <div className="sp-col__header-title">
                    {improvementsManagerTitle}
                  </div>
                </div>
                <div className="sp-col__header-sub">
                  {improvementsManagerSubTitle}
                </div>

                <div className="sp-col__body sp-col__body--manager">
                  {effectiveImprovementsManagerItems.map((it, idx) => (
                    <div
                      key={`im-${idx}`}
                      className="sp-row sp-row--manager"
                      style={{
                        position: "absolute",
                        top: idx === 0 ? 22 : idx === 1 ? 122 : 223,
                      }}
                    >
                      <div className="sp-pill">
                        {Number(it.score).toFixed(2)}
                      </div>
                      <div className="sp-card">{it.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
    );

    return out;
  }, [
    arcColor,
    groupItems,
    groupSubTitle,
    groupTitle,
    handleImprovementPointsLine,
    handleStrengthPointsLine,
    improvementPoints.length,
    improvementsGroupItems,
    improvementsGroupSubTitle,
    improvementsGroupTitle,
    improvementsManagerItems,
    improvementsManagerSubTitle,
    improvementsManagerTitle,
    improvementsTitle,
    managerItems,
    managerSubTitle,
    managerTitle,
    strengthPoints.length,
    title,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1223}
      pagePadding={0}
      contentClassName="strengths-page"
      componentId="strengths-page"
    />
  );
};

export default StrengthsPage;
