import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import ArcConnector from "./ArcConnector";
import strengthImage from "../assets/png/strengthImage.png";
import "../styles/strengthsPage.scss";
import measurementManager from "./measurementManager";

const StrengthsPage = ({
  startPage = 4,
  title = "Strengths",
  groupTitle = "Teachers and Office Staff",
  groupSubTitle = "(Ratings > 4.5 Only)",
  managerTitle = "Manager Rating",
  managerSubTitle = "(Ratings > 4 Only)",
  arcColor = "var(--color-green-mid)",
  improvementsTitle = "Opportunities For Further Development",
  improvementsGroupTitle = "Teachers and Office Staff",
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

  const [managerChunks, setManagerChunks] = useState(null);
  const measurementId = useRef(`strengths-manager-${Date.now()}-${Math.random().toString(36).slice(2)}`);

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
      managerStrengths: managerStrengths,
      managerImprovements: managerImprovements,
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

  const getArcRowTop = useCallback((points, index, bodyHeight, arcHeight) => {
    const y = points?.[index]?.y;
    if (!Number.isFinite(y) || !Number.isFinite(bodyHeight) || !arcHeight) {
      return 0;
    }

    const pillMarginTop = 12;
    const pillHeight = 40;
    const lineY =
      pillMarginTop + pillHeight - (index === 0 ? 10 : index === 1 ? 5 : 0) / 2;

    const scaleY = bodyHeight / arcHeight;
    const yScaled = y * scaleY;
    const top = Math.round(yScaled - lineY);
    return Math.max(0, Math.min(bodyHeight - 1, top));
  }, []);

  const getConnectorLineStyle = useCallback((points, index) => {
    const x = points?.[index]?.x;
    const pillMarginTop = 12;
    const pillHeight = 40;
    const lineY = pillMarginTop + pillHeight / 2;

    if (!Number.isFinite(x)) {
      return { top: lineY, width: 0, left: 0 };
    }

    const width = Math.max(0, Math.min(150 - x, 50));
    const left = -(155 - x);
    return { top: lineY, width, left };
  }, []);

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let cancelled = false;
    const PAGE_HEIGHT = 1053;
    const PAGE_WIDTH = 794;

    const renderMeasure = async ({ startIdx, endIdx, includeHeader, includeGroup }) => {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.visibility = "hidden";
        container.style.width = `${PAGE_WIDTH}px`;
        container.style.left = "-100000px";
        container.style.top = "0";
        container.style.zIndex = "-9999";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);

        const root = createRoot(container);

        const slice = effectiveManagerItems.slice(startIdx, endIdx);
        const groupToRender = includeGroup ? effectiveGroupItems : [];

        root.render(
          <div className="strengths-page">
            <div className="sp sp-strengths">
              {includeHeader ? <FeedbackCommonHeader title={title} /> : null}
              <div
                className="sp-grid"
                style={{
                  "--sp-arc-color": arcColor,
                  "--sp-left-height": `330px`,
                }}
              >
                <div className="sp-left">
                  {includeGroup ? (
                    <>
                      <ArcConnector
                        items={groupToRender}
                        arcColor={"var(--strength-arc-color)"}
                        arcHeight={450}
                        paddingTop={85}
                        paddingBottom={85}
                        circleColor={"var(--strength-pill-bg)"}
                        circleBorderColor={"var(--strength-arc-color)"}
                        strokeWidth={6}
                        circleRadius={10}
                      />
                      <div className="sp-left__icon" aria-hidden="true">
                        <img src={strengthImage} alt="" className="sp-left__img" />
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="sp-right">
                  <div className="sp-cols">
                    <div className="sp-col">
                      <div className="sp-col__header">
                        <div className="sp-col__header-title">{groupTitle}</div>
                      </div>
                      {/* <div className="sp-col__header-sub">{groupSubTitle}</div> */}

                      <div className="sp-col__body" style={{ height: 330 }}>
                        {includeGroup && groupToRender.length ? (
                          groupToRender.map((it, i) => (
                            <div key={`mg-${i}`} className="sp-row" style={{ top: 0 }}>
                              <div className="sp-pill">{Number(it.score).toFixed(2)}</div>
                              <div className="sp-card">{it.text}</div>
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>

                    <div className="sp-divider" aria-hidden="true" />

                    <div className="sp-col">
                      <div className="sp-col__header sp-col__header--manager">
                        <div className="sp-col__header-title">{managerTitle}</div>
                      </div>
                      {/* <div className="sp-col__header-sub">{managerSubTitle}</div> */}

                      <div className="sp-col__body sp-col__body--manager">
                        {slice.map((it, idx) => (
                          <div key={`mm-${idx}`} className="sp-row sp-row--manager">
                            <div className="sp-pill">{Number(it.score).toFixed(2)}</div>
                            <div className="sp-card">{it.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        const measure = async () => {
          try {
            if (document.fonts?.ready) await document.fonts.ready;
            await new Promise((r) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(r);
                });
              });
            });

            const rect = container.firstElementChild?.getBoundingClientRect();
            resolve(Math.ceil(rect?.height || 0));
          } catch {
            resolve(0);
          } finally {
            try {
              root.unmount();
            } catch {}
            container.remove();
          }
        };

        setTimeout(measure, 10);
      });
    };

    const buildChunks = async () => {
      const items = Array.isArray(effectiveManagerItems) ? effectiveManagerItems : [];
      if (!items.length) {
        setManagerChunks([]);
        return;
      }

      const nextChunks = [];
      let start = 0;
      let isFirst = true;

      while (start < items.length) {
        let lo = start + 1;
        let hi = items.length;
        let best = lo;

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          // Ensure at least one item
          if (mid <= start) {
            lo = start + 1;
            continue;
          }

          const h = await renderMeasure({
            startIdx: start,
            endIdx: mid,
            includeHeader: isFirst,
            includeGroup: isFirst,
          });

          if (h > 0 && h <= PAGE_HEIGHT) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        // Safety: always progress
        if (best <= start) best = start + 1;
        nextChunks.push({ start, end: best, isFirst });
        start = best;
        isFirst = false;
      }

      if (!cancelled) setManagerChunks(nextChunks);
    };

    const run = async () => {
      await measurementManager.addToQueue(measurementId.current, async () => {
        if (cancelled) return;
        await buildChunks();
      });
    };

    setManagerChunks(null);
    run();

    return () => {
      cancelled = true;
      measurementManager.removeFromQueue(measurementId.current);
    };
  }, [
    arcColor,
    effectiveGroupItems,
    effectiveManagerItems,
    groupSubTitle,
    groupTitle,
    managerSubTitle,
    managerTitle,
    title,
  ]);

  const blocks = useMemo(() => {
    const out = [];

    const topOffset = 85;
    const arcHeight = 450;
    const paddingTop = topOffset;
    const paddingBottom = topOffset;
    const bodyHeight = 330;

    const resolvedChunks = Array.isArray(managerChunks)
      ? managerChunks
      : [{ start: 0, end: effectiveManagerItems.length, isFirst: true }];

    resolvedChunks.forEach((chunk, chunkIdx) => {
      const managerSlice = effectiveManagerItems.slice(chunk.start, chunk.end);
      const showGroup = !!chunk.isFirst;
      const groupToRender = showGroup ? effectiveGroupItems : [];

      out.push(
        <div key={`strengths-${chunkIdx}`} className="sp sp-strengths">
          {chunk.isFirst ? <FeedbackCommonHeader title={title} /> : null}

          <div
            className="sp-grid"
            style={{
              "--sp-arc-color": arcColor,
              "--sp-left-height": `${bodyHeight}px`,
            }}
          >
            <div className="sp-left">
              {showGroup ? (
                <>
                  <ArcConnector
                    items={groupToRender}
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
                </>
              ) : null}
            </div>

            <div className="sp-right">
              <div className="sp-cols">
                <div className="sp-col">
                  <div className="sp-col__header">
                    <div className="sp-col__header-title">{groupTitle}</div>
                  </div>
                  {/* <div className="sp-col__header-sub">{groupSubTitle}</div> */}

                  <div className="sp-col__body" style={{ height: bodyHeight }}>
                    {showGroup &&
                      strengthPoints.length === groupToRender.length &&
                      groupToRender.map((it, i) => (
                        <div
                          key={`g-${chunkIdx}-${i}`}
                          className="sp-row"
                          style={{
                            top: getArcRowTop(
                              strengthPoints,
                              i,
                              bodyHeight,
                              arcHeight,
                            ),
                          }}
                        >
                          <div
                            className="sp-row__line"
                            style={getConnectorLineStyle(strengthPoints, i)}
                          />
                          <div className="sp-pill">{Number(it.score).toFixed(2)}</div>
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
                  {/* <div className="sp-col__header-sub">{managerSubTitle}</div> */}

                  <div className="sp-col__body sp-col__body--manager">
                    {managerSlice.map((it, idx) => (
                      <div key={`m-${chunkIdx}-${idx}`} className="sp-row sp-row--manager">
                        <div className="sp-pill">{Number(it.score).toFixed(2)}</div>
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
    });

    out.push(
      <div key="improvements" className="sp sp--improvement">
        <FeedbackCommonHeader title={improvementsTitle} />

        <div
          className="sp-grid"
          style={{
            "--sp-arc-color": "var(--feedback-initial-underline-color)",
            "--sp-left-height": `${bodyHeight}px`,
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
              circleColor={"var(--improve-pill-bg)"}
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
                {/* <div className="sp-col__header-sub">
                  {improvementsGroupSubTitle}
                </div> */}

                <div className="sp-col__body" style={{ height: bodyHeight }}>
                  {improvementPoints.length ===
                    effectiveImprovementsGroupItems.length &&
                    effectiveImprovementsGroupItems.map((it, i) => (
                      <div
                        key={`ig-${i}`}
                        className="sp-row"
                        style={{
                          top: getArcRowTop(
                            improvementPoints,
                            i,
                            bodyHeight,
                            arcHeight,
                          ),
                        }}
                      >
                        <div
                          className="sp-row__line"
                          style={getConnectorLineStyle(improvementPoints, i)}
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
                {/* <div className="sp-col__header-sub">
                  {improvementsManagerSubTitle}
                </div> */}

                <div className="sp-col__body sp-col__body--manager">
                  {effectiveImprovementsManagerItems.map((it, idx) => (
                    <div
                      key={`im-${idx}`}
                      className="sp-row sp-row--manager"
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
    managerChunks,
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
