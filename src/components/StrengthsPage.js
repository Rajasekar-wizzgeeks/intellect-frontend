import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
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
  const [managerChunks, setManagerChunks] = useState(null);
  const [improvementsManagerChunks, setImprovementsManagerChunks] = useState(null);
  const measurementId = useRef(`strengths-manager-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const improvementsMeasurementId = useRef(`improvements-manager-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [layoutTick, setLayoutTick] = useState(0);

  const repeatItems = useCallback((arr, times) => {
    const list = Array.isArray(arr) ? arr : [];
    if (times <= 1) return list;
    return Array.from({ length: times }, () => list).flat();
  }, []);

  const effectivePageWidth = useMemo(() => {
    const isBrowser = typeof window !== "undefined";
    if (!isBrowser) return 794;
    const w = Math.max(320, Number(window.innerWidth) || 0);
    return Math.min(794, w);
  }, [layoutTick]);

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let rafId = null;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setLayoutTick((t) => t + 1));
    };

    window.addEventListener("resize", onResize);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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

  const repeatedGroupItems = useMemo(
    () => repeatItems(effectiveGroupItems, 3),
    [effectiveGroupItems, repeatItems],
  );

  const repeatedManagerItems = useMemo(
    () => repeatItems(effectiveManagerItems, 3),
    [effectiveManagerItems, repeatItems],
  );

  const repeatedImprovementsGroupItems = useMemo(
    () => repeatItems(effectiveImprovementsGroupItems, 3),
    [effectiveImprovementsGroupItems, repeatItems],
  );

  const repeatedImprovementsManagerItems = useMemo(
    () => repeatItems(effectiveImprovementsManagerItems, 3),
    [effectiveImprovementsManagerItems, repeatItems],
  );

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let cancelled = false;
    const PAGE_HEIGHT = 1123;
    const PAGE_WIDTH = effectivePageWidth;

    const renderMeasure = async ({ startIdx, endIdx, includeHeader, includeLeft }) => {
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

        const slice = repeatedImprovementsManagerItems.slice(startIdx, endIdx);

        root.render(
          <div className="strengths-page">
            <div className="sp sp--improvement">
              {includeHeader ? <FeedbackCommonHeader title={improvementsTitle} /> : null}

              <div
                className="sp-grid"
                style={{
                  "--sp-arc-color": "var(--feedback-initial-underline-color)",
                  "--sp-left-height": `330px`,
                }}
              >
                <div className="sp-right">
                  <div className="sp-cols">
                    <div className="sp-col">
                      <div className="sp-col__header">
                        <div className="sp-col__header-title">{improvementsGroupTitle}</div>
                      </div>
                      <div className="sp-col__body" style={{ height: 330 }} />
                    </div>

                    <div className="sp-divider" aria-hidden="true" />

                    <div className="sp-col">
                      <div className="sp-col__header sp-col__header--manager">
                        <div className="sp-col__header-title">{improvementsManagerTitle}</div>
                      </div>

                      <div className="sp-col__body sp-col__body--manager">
                        {slice.map((it, idx) => (
                          <div key={`im-m-${idx}`} className="sp-row sp-row--manager">
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
          </div>,
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

            await new Promise((r) => setTimeout(r, 30));

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

        setTimeout(measure, 30);
      });
    };

    const buildChunks = async () => {
      const items = Array.isArray(repeatedImprovementsManagerItems)
        ? repeatedImprovementsManagerItems
        : [];
      if (!items.length) {
        setImprovementsManagerChunks([]);
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
          if (mid <= start) {
            lo = start + 1;
            continue;
          }

          const h = await renderMeasure({
            startIdx: start,
            endIdx: mid,
            includeHeader: isFirst,
            includeLeft: isFirst,
          });

          if (h > 0 && h <= PAGE_HEIGHT) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        if (best <= start) best = start + 1;
        nextChunks.push({ start, end: best, isFirst });
        start = best;
        isFirst = false;
      }

      if (!cancelled) setImprovementsManagerChunks(nextChunks);
    };

    const run = async () => {
      await measurementManager.addToQueue(improvementsMeasurementId.current, async () => {
        if (cancelled) return;
        await buildChunks();
      });
    };

    setImprovementsManagerChunks(null);
    run();

    return () => {
      cancelled = true;
      measurementManager.removeFromQueue(improvementsMeasurementId.current);
    };
  }, [
    improvementsGroupTitle,
    improvementsManagerTitle,
    improvementsTitle,
    repeatedImprovementsManagerItems,
    repeatedImprovementsGroupItems,
    layoutTick,
    effectivePageWidth,
  ]);

  const arePointsEqual = (a, b) => {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i]?.x !== b[i]?.x || a[i]?.y !== b[i]?.y) return false;
    }
    return true;
  };

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let cancelled = false;
    const PAGE_HEIGHT = 1123;
    const PAGE_WIDTH = effectivePageWidth;

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

        const slice = repeatedManagerItems.slice(startIdx, endIdx);
        const groupToRender = includeGroup ? repeatedGroupItems : [];

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
      const items = Array.isArray(repeatedManagerItems) ? repeatedManagerItems : [];
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
    repeatedGroupItems,
    repeatedManagerItems,
    groupSubTitle,
    groupTitle,
    managerSubTitle,
    managerTitle,
    title,
    layoutTick,
    effectivePageWidth,
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
      : [{ start: 0, end: repeatedManagerItems.length, isFirst: true }];

    resolvedChunks.forEach((chunk, chunkIdx) => {
      const managerSlice = repeatedManagerItems.slice(chunk.start, chunk.end);
      const showGroup = !!chunk.isFirst;
      const groupToRender = showGroup ? repeatedGroupItems : [];

      out.push(
        <div
          key={`strengths-${chunkIdx}`}
          className="sp sp-strengths"
          data-force-page-break="before"
          style={{ breakBefore: "page", pageBreakBefore: "always" }}
        >
          {chunk.isFirst ? <FeedbackCommonHeader title={title} /> : null}

          <div
            className="sp-grid"
            style={{
              "--sp-arc-color": arcColor,
              "--sp-left-height": `${bodyHeight}px`,
            }}
          >
            <div className="sp-right">
              <div className="sp-cols">
                <div className="sp-col">
                  <div className="sp-col__header">
                    <div className="sp-col__header-title">{groupTitle}</div>
                  </div>
                  {/* <div className="sp-col__header-sub">{groupSubTitle}</div> */}

                  <div className="sp-col__body" style={{ height: bodyHeight }}>
                    {showGroup
                      ? groupToRender.map((it, i) => (
                          <div
                            key={`g-${chunkIdx}-${i}`}
                            className="sp-row sp-row--manager"
                          >
                            <div className="sp-pill">{Number(it.score).toFixed(2)}</div>
                            <div className="sp-card">{it.text}</div>
                          </div>
                        ))
                      : null}
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

    const improvementsResolvedChunks = Array.isArray(improvementsManagerChunks)
      ? improvementsManagerChunks
      : [{ start: 0, end: repeatedImprovementsManagerItems.length, isFirst: true }];

    improvementsResolvedChunks.forEach((chunk, idx) => {
      const managerSlice = repeatedImprovementsManagerItems.slice(chunk.start, chunk.end);
      const showLeft = !!chunk.isFirst;

      out.push(
        <div
          key={`improvements-${idx}`}
          className="sp sp--improvement"
          data-force-page-break="before"
          style={{ breakBefore: "page", pageBreakBefore: "always" }}
        >
          {chunk.isFirst ? <FeedbackCommonHeader title={improvementsTitle} /> : null}

          <div
            className="sp-grid"
            style={{
              "--sp-arc-color": "var(--feedback-initial-underline-color)",
              "--sp-left-height": `${bodyHeight}px`,
            }}
          >
            <div className="sp-right">
              <div className="sp-cols">
                <div className="sp-col">
                  <div className="sp-col__header">
                    <div className="sp-col__header-title">
                      {improvementsGroupTitle}
                    </div>
                  </div>

                  <div className="sp-col__body" style={{ height: bodyHeight }}>
                    {showLeft
                      ? repeatedImprovementsGroupItems.map((it, i) => (
                          <div
                            key={`ig-${idx}-${i}`}
                            className="sp-row sp-row--manager"
                          >
                            <div className="sp-pill">
                              {Number(it.score).toFixed(2)}
                            </div>
                            <div className="sp-card"> {it.text}</div>
                          </div>
                        ))
                      : null}
                  </div>
                </div>

                <div className="sp-divider" aria-hidden="true" />

                <div className="sp-col">
                  <div className="sp-col__header sp-col__header--manager">
                    <div className="sp-col__header-title">
                      {improvementsManagerTitle}
                    </div>
                  </div>

                  <div className="sp-col__body sp-col__body--manager">
                    {managerSlice.map((it, rowIdx) => (
                      <div
                        key={`im-${idx}-${rowIdx}`}
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
    });

    return out;
  }, [
    arcColor,
    groupItems,
    groupSubTitle,
    groupTitle,
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
    repeatedImprovementsManagerItems,
    improvementsManagerChunks,
    title,
    repeatedGroupItems,
    repeatedManagerItems,
    repeatedImprovementsGroupItems,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={effectivePageWidth}
      pageHeight={1123}
      pagePadding={0}
      pagePaddingTop={0}
      pagePaddingBottom={70}
      contentClassName="strengths-page"
      componentId="strengths-page"
    />
  );
};

export default StrengthsPage;
