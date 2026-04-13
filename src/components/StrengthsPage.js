import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Plus } from "lucide-react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/strengthsPage.scss";
import measurementManager from "./measurementManager";

const EditablePill = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(editValue);
    }
  };

  return (
    <input
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="sp-edit-pill-input"
    />
  );
};

const EditableText = ({ value, onSave, onCancel }) => {
  const [text, setText] = useState(String(value ?? ""));
  const textAreaRef = useRef(null);

  const adjustHeight = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    } else if (e.key === "Escape") {
      onCancel?.();
    }
  };

  return (
    <textarea
      ref={textAreaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(text)}
      autoFocus
      className="sp-edit-textarea"
      rows={1}
      style={{ 
        height: 'auto',
        minHeight: '1.35em',
        overflow: 'hidden',
        width: '100%',
        display: 'block'
      }}
    />
  );
};

const NewItemRow = ({ onSave, onCancel }) => {
  const [score, setScore] = useState("");
  const [text, setText] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const cleanedText = String(text ?? "").trim();
      if (cleanedText) {
        onSave({ score, text: cleanedText });
      } else {
        onCancel();
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="sp-row sp-row--manager">
      <div className="sp-pill">
        <input
          type="text"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="0.00"
          className="sp-edit-pill-input"
        />
      </div>
      <div className="sp-card">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            const cleanedText = String(text ?? "").trim();
            if (cleanedText) {
              onSave({ score, text: cleanedText });
            } else {
              onCancel();
            }
          }}
          placeholder="Enter description..."
          className="sp-edit-textarea"
          autoFocus={false}
          rows={1}
          style={{ 
            height: 'auto',
            minHeight: '1.35em',
            overflow: 'hidden'
          }}
        />
      </div>
    </div>
  );
};

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
  const isDirtyRef = useRef(false);

  const [strengthsGroupItemsDraft, setStrengthsGroupItemsDraft] = useState([]);
  const [strengthsManagerItemsDraft, setStrengthsManagerItemsDraft] = useState([]);
  const [improvementsGroupItemsDraft, setImprovementsGroupItemsDraft] = useState([]);
  const [improvementsManagerItemsDraft, setImprovementsManagerItemsDraft] = useState([]);

  const [editing, setEditing] = useState(null);
  const [editingPill, setEditingPill] = useState(null);
  const [adding, setAdding] = useState(null);

  const updateList = useCallback((section, column, next) => {
    isDirtyRef.current = true;
    const safeNext = Array.isArray(next) ? next : [];
    if (section === "strengths" && column === "group") setStrengthsGroupItemsDraft(safeNext);
    else if (section === "strengths" && column === "manager") setStrengthsManagerItemsDraft(safeNext);
    else if (section === "improvements" && column === "group") setImprovementsGroupItemsDraft(safeNext);
    else setImprovementsManagerItemsDraft(safeNext);
  }, []);

  const resolveList = useCallback((section, column) => {
    if (section === "strengths" && column === "group") return strengthsGroupItemsDraft;
    if (section === "strengths" && column === "manager") return strengthsManagerItemsDraft;
    if (section === "improvements" && column === "group") return improvementsGroupItemsDraft;
    return improvementsManagerItemsDraft;
  }, [
    strengthsGroupItemsDraft,
    strengthsManagerItemsDraft,
    improvementsGroupItemsDraft,
    improvementsManagerItemsDraft,
  ]);

  const saveScore = useCallback((section, column, idx, newValue) => {
    const current = resolveList(section, column);
    const next = [...current];
    const prev = next[idx] || {};
    next[idx] = { ...prev, score: newValue };

    updateList(section, column, next);
    setEditingPill(null);
  }, [resolveList, updateList]);

  const saveNewScore = useCallback((section, column, newValue) => {
    // This could be used if we want to set score while adding, but currently add only sets text
    setAdding(prev => ({ ...prev, score: newValue }));
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
      groupStrengths,
      groupImprovements,
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

  useEffect(() => {
    if (isDirtyRef.current) return;

    const normalize = (arr) =>
      (Array.isArray(arr) ? arr : []).map((it) => ({
        score: it?.score,
        text: it?.text ?? "",
      }));

    setStrengthsGroupItemsDraft(normalize(effectiveGroupItems));
    setStrengthsManagerItemsDraft(normalize(effectiveManagerItems));
    setImprovementsGroupItemsDraft(normalize(effectiveImprovementsGroupItems));
    setImprovementsManagerItemsDraft(normalize(effectiveImprovementsManagerItems));
  }, [
    effectiveGroupItems,
    effectiveManagerItems,
    effectiveImprovementsGroupItems,
    effectiveImprovementsManagerItems,
  ]);

  const formatScore = useCallback((score) => {
    const n = Number(score);
    return Number.isFinite(n) ? n.toFixed(2) : "";
  }, []);

  const saveText = useCallback((section, column, idx, newValue) => {
    const cleaned = String(newValue ?? "").trim();
    const current = resolveList(section, column);
    const next = [...current];

    if (!cleaned) {
      next.splice(idx, 1);
    } else {
      const prev = next[idx] || {};
      next[idx] = { ...prev, text: cleaned };
    }

    updateList(section, column, next);
    setEditing(null);
  }, [resolveList, updateList]);

  const saveNewItem = useCallback((section, column, item, insertIdx) => {
    const current = resolveList(section, column);
    const next = [...current];
    if (typeof insertIdx === "number" && insertIdx >= 0 && insertIdx <= next.length) {
      next.splice(insertIdx, 0, item);
    } else {
      next.push(item);
    }
    updateList(section, column, next);
    setAdding(null);
  }, [resolveList, updateList]);

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let cancelled = false;
    const PAGE_HEIGHT = 1123;
    const PAGE_WIDTH = effectivePageWidth;

    const renderMeasure = async ({ startIdx, endIdx, includeHeader }) => {
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

        const maxLen = Math.max(
          improvementsGroupItemsDraft.length,
          improvementsManagerItemsDraft.length,
        );

        const boundedStart = Math.min(Math.max(0, startIdx), maxLen);
        const boundedEnd = Math.min(Math.max(boundedStart, endIdx), maxLen);

        const sliceLeft = improvementsGroupItemsDraft.slice(boundedStart, boundedEnd);
        const sliceRight = improvementsManagerItemsDraft.slice(boundedStart, boundedEnd);

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
                      <div className="sp-col__body">
                        {sliceLeft.map((it, idx) => (
                          <div key={`im-g-${idx}`} className="sp-row sp-row--manager">
                            <div className="sp-pill">{formatScore(it.score)}</div>
                            <div className="sp-card">{it.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sp-divider" aria-hidden="true" />

                    <div className="sp-col">
                      <div className="sp-col__header sp-col__header--manager">
                        <div className="sp-col__header-title">{improvementsManagerTitle}</div>
                      </div>

                      <div className="sp-col__body sp-col__body--manager">
                        {sliceRight.map((it, idx) => (
                          <div key={`im-m-${idx}`} className="sp-row sp-row--manager">
                            <div className="sp-pill">{formatScore(it.score)}</div>
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
      const leftItems = Array.isArray(improvementsGroupItemsDraft)
        ? improvementsGroupItemsDraft
        : [];
      const rightItems = Array.isArray(improvementsManagerItemsDraft)
        ? improvementsManagerItemsDraft
        : [];

      const maxLen = Math.max(leftItems.length, rightItems.length);

      if (!maxLen) {
        setImprovementsManagerChunks([]);
        return;
      }

      const nextChunks = [];
      let start = 0;
      let isFirst = true;

      while (start < maxLen) {
        let lo = start + 1;
        let hi = maxLen;
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
    improvementsManagerItemsDraft,
    improvementsGroupItemsDraft,
    layoutTick,
    effectivePageWidth,
    formatScore,
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

    const renderMeasure = async ({ startIdx, endIdx, includeHeader }) => {
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

        const maxLen = Math.max(strengthsGroupItemsDraft.length, strengthsManagerItemsDraft.length);

        const boundedStart = Math.min(Math.max(0, startIdx), maxLen);
        const boundedEnd = Math.min(Math.max(boundedStart, endIdx), maxLen);

        const sliceLeft = strengthsGroupItemsDraft.slice(boundedStart, boundedEnd);
        const sliceRight = strengthsManagerItemsDraft.slice(boundedStart, boundedEnd);

        root.render(
          <div className="strengths-page">
            <div className="sp sp-strengths">
              {includeHeader ? <FeedbackCommonHeader title={title} /> : null}
              <div
                className="sp-grid"
                style={{
                  "--sp-arc-color": arcColor,
                  "--sp-left-height": `auto`,
                }}
              >
                <div className="sp-right">
                  <div className="sp-cols">
                    <div className="sp-col">
                      <div className="sp-col__header">
                        <div className="sp-col__header-title">
                          <span>{groupTitle}</span>
                          <button type="button" className="sp-col__add-btn" title="Add item">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      {/* <div className="sp-col__header-sub">{groupSubTitle}</div> */}

                      <div className="sp-col__body">
                        {sliceLeft.map((it, i) => (
                          <div key={`mg-${i}`} className="sp-row" style={{ top: 0 }}>
                            <div className="sp-pill">{formatScore(it.score)}</div>
                            <div className="sp-card">{it.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sp-divider" aria-hidden="true" />

                    <div className="sp-col">
                      <div className="sp-col__header sp-col__header--manager">
                        <div className="sp-col__header-title">
                          <span>{managerTitle}</span>
                          <button type="button" className="sp-col__add-btn" title="Add item">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      {/* <div className="sp-col__header-sub">{managerSubTitle}</div> */}

                      <div className="sp-col__body sp-col__body--manager">
                        {sliceRight.map((it, idx) => (
                          <div key={`mm-${idx}`} className="sp-row sp-row--manager">
                            <div className="sp-pill">{formatScore(it.score)}</div>
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
      const leftItems = Array.isArray(strengthsGroupItemsDraft) ? strengthsGroupItemsDraft : [];
      const rightItems = Array.isArray(strengthsManagerItemsDraft) ? strengthsManagerItemsDraft : [];
      const maxLen = Math.max(leftItems.length, rightItems.length);

      if (!maxLen) {
        setManagerChunks([]);
        return;
      }

      const nextChunks = [];
      let start = 0;
      let isFirst = true;

      while (start < maxLen) {
        let lo = start + 1;
        let hi = maxLen;
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
    strengthsGroupItemsDraft,
    strengthsManagerItemsDraft,
    groupSubTitle,
    groupTitle,
    managerSubTitle,
    managerTitle,
    title,
    layoutTick,
    effectivePageWidth,
    formatScore,
  ]);

  const blocks = useMemo(() => {
    const out = [];

    const resolvedChunks = Array.isArray(managerChunks)
      ? managerChunks
      : [{ start: 0, end: Math.max(strengthsGroupItemsDraft.length, strengthsManagerItemsDraft.length), isFirst: true }];

    resolvedChunks.forEach((chunk, chunkIdx) => {
      const groupSlice = strengthsGroupItemsDraft.slice(chunk.start, chunk.end);
      const managerSlice = strengthsManagerItemsDraft.slice(chunk.start, chunk.end);

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
              "--sp-left-height": `auto`,
            }}
          >
            <div className="sp-right">
              <div className="sp-cols">
                <div className="sp-col">
                  <div className="sp-col__header">
                    <div className="sp-col__header-title">
                      <span>{groupTitle}</span>
                    </div>
                  </div>
                  {/* <div className="sp-col__header-sub">{groupSubTitle}</div> */}

                  <div className="sp-col__body">
                    {groupSlice.map((it, i) => (
                        <Fragment key={`g-${chunkIdx}-${i}`}>
                          <div
                            className="sp-row sp-row--manager"
                          >
                            <div
                              className="sp-pill"
                              onDoubleClick={() =>
                                setEditingPill({ section: "strengths", column: "group", idx: chunk.start + i })
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {editingPill?.section === "strengths" &&
                              editingPill?.column === "group" &&
                              editingPill?.idx === chunk.start + i ? (
                                <EditablePill
                                  value={it.score}
                                  onSave={(v) => saveScore("strengths", "group", chunk.start + i, v)}
                                />
                              ) : (
                                formatScore(it.score)
                              )}
                            </div>
                            <div
                              className="sp-card"
                              onDoubleClick={() =>
                                setEditing({ section: "strengths", column: "group", idx: chunk.start + i })
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {editing?.section === "strengths" &&
                              editing?.column === "group" &&
                              editing?.idx === chunk.start + i ? (
                                <EditableText
                                  value={it.text}
                                  onSave={(v) => saveText("strengths", "group", chunk.start + i, v)}
                                  onCancel={() => setEditing(null)}
                                />
                              ) : (
                                it.text
                              )}
                            </div>
                            <button
                              type="button"
                              className="sp-row__add-btn"
                              onClick={() => setAdding({ section: "strengths", column: "group", idx: chunk.start + i })}
                              title="Add item"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {adding?.section === "strengths" &&
                          adding?.column === "group" &&
                          adding?.idx === chunk.start + i ? (
                            <NewItemRow
                              onSave={(item) =>
                                saveNewItem(
                                  "strengths",
                                  "group",
                                  item,
                                  adding.idx !== undefined ? adding.idx + 1 : undefined
                                )
                              }
                              onCancel={() => setAdding(null)}
                            />
                          ) : null}
                        </Fragment>
                    ))}

                    {adding?.section === "strengths" &&
                    adding?.column === "group" &&
                    adding?.idx === -1 ? (
                      <NewItemRow
                        onSave={(item) => saveNewItem("strengths", "group", item, 0)}
                        onCancel={() => setAdding(null)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="sp-divider" aria-hidden="true" />

                <div className="sp-col">
                  <div className="sp-col__header sp-col__header--manager">
                    <div className="sp-col__header-title">
                      <span>{managerTitle}</span>
                    </div>
                  </div>
                  {/* <div className="sp-col__header-sub">{managerSubTitle}</div> */}

                  <div className="sp-col__body sp-col__body--manager">
                    {managerSlice.map((it, idx) => (
                      <Fragment key={`m-${chunkIdx}-${idx}`}>
                        <div className="sp-row sp-row--manager">
                          <div
                            className="sp-pill"
                            onDoubleClick={() =>
                              setEditingPill({ section: "strengths", column: "manager", idx: chunk.start + idx })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {editingPill?.section === "strengths" &&
                            editingPill?.column === "manager" &&
                            editingPill?.idx === chunk.start + idx ? (
                              <EditablePill
                                value={it.score}
                                onSave={(v) => saveScore("strengths", "manager", chunk.start + idx, v)}
                              />
                            ) : (
                              formatScore(it.score)
                            )}
                          </div>
                          <div
                            className="sp-card"
                            onDoubleClick={() =>
                              setEditing({ section: "strengths", column: "manager", idx: chunk.start + idx })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {editing?.section === "strengths" &&
                            editing?.column === "manager" &&
                            editing?.idx === chunk.start + idx ? (
                              <EditableText
                                value={it.text}
                                onSave={(v) => saveText("strengths", "manager", chunk.start + idx, v)}
                                onCancel={() => setEditing(null)}
                              />
                            ) : (
                              it.text
                            )}
                          </div>
                          <button
                            type="button"
                            className="sp-row__add-btn"
                            onClick={() => setAdding({ section: "strengths", column: "manager", idx: chunk.start + idx })}
                            title="Add item"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {adding?.section === "strengths" &&
                        adding?.column === "manager" &&
                        adding?.idx === chunk.start + idx ? (
                          <NewItemRow
                            onSave={(item) =>
                              saveNewItem(
                                "strengths",
                                "manager",
                                item,
                                adding.idx !== undefined ? adding.idx + 1 : undefined
                              )
                            }
                            onCancel={() => setAdding(null)}
                          />
                        ) : null}
                      </Fragment>
                    ))}

                    {adding?.section === "strengths" &&
                    adding?.column === "manager" &&
                    adding?.idx === -1 ? (
                      <NewItemRow
                        onSave={(item) => saveNewItem("strengths", "manager", item, 0)}
                        onCancel={() => setAdding(null)}
                      />
                    ) : null}
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
      : [{ start: 0, end: Math.max(improvementsGroupItemsDraft.length, improvementsManagerItemsDraft.length), isFirst: true }];

    improvementsResolvedChunks.forEach((chunk, idx) => {
      const groupSlice = improvementsGroupItemsDraft.slice(chunk.start, chunk.end);
      const managerSlice = improvementsManagerItemsDraft.slice(chunk.start, chunk.end);

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
              "--sp-left-height": `auto`,
            }}
          >
            <div className="sp-right">
              <div className="sp-cols">
                <div className="sp-col">
                  <div className="sp-col__header">
                    <div className="sp-col__header-title">
                      <span>{improvementsGroupTitle}</span>
                    </div>
                  </div>

                  <div className="sp-col__body">
                    {groupSlice.map((it, i) => (
                        <Fragment key={`ig-${idx}-${i}`}>
                          <div
                            className="sp-row sp-row--manager"
                          >
                            <div
                              className="sp-pill"
                              onDoubleClick={() =>
                                setEditingPill({ section: "improvements", column: "group", idx: chunk.start + i })
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {editingPill?.section === "improvements" &&
                              editingPill?.column === "group" &&
                              editingPill?.idx === chunk.start + i ? (
                                <EditablePill
                                  value={it.score}
                                  onSave={(v) => saveScore("improvements", "group", chunk.start + i, v)}
                                />
                              ) : (
                                formatScore(it.score)
                              )}
                            </div>
                            <div
                              className="sp-card"
                              onDoubleClick={() =>
                                setEditing({ section: "improvements", column: "group", idx: chunk.start + i })
                              }
                              style={{ cursor: "pointer" }}
                            >
                              {editing?.section === "improvements" &&
                              editing?.column === "group" &&
                              editing?.idx === chunk.start + i ? (
                                <EditableText
                                  value={it.text}
                                  onSave={(v) => saveText("improvements", "group", chunk.start + i, v)}
                                  onCancel={() => setEditing(null)}
                                />
                              ) : (
                                it.text
                              )}
                            </div>
                            <button
                              type="button"
                              className="sp-row__add-btn"
                              onClick={() => setAdding({ section: "improvements", column: "group", idx: chunk.start + i })}
                              title="Add item"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {adding?.section === "improvements" &&
                          adding?.column === "group" &&
                          adding?.idx === chunk.start + i ? (
                            <NewItemRow
                              onSave={(item) =>
                                saveNewItem(
                                  "improvements",
                                  "group",
                                  item,
                                  adding.idx !== undefined ? adding.idx + 1 : undefined
                                )
                              }
                              onCancel={() => setAdding(null)}
                            />
                          ) : null}
                        </Fragment>
                    ))}

                    {adding?.section === "improvements" &&
                    adding?.column === "group" &&
                    adding?.idx === -1 ? (
                      <NewItemRow
                        onSave={(item) => saveNewItem("improvements", "group", item, 0)}
                        onCancel={() => setAdding(null)}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="sp-divider" aria-hidden="true" />

                <div className="sp-col">
                  <div className="sp-col__header sp-col__header--manager">
                    <div className="sp-col__header-title">
                      <span>{improvementsManagerTitle}</span>
                    </div>
                  </div>

                  <div className="sp-col__body sp-col__body--manager">
                    {managerSlice.map((it, rowIdx) => (
                      <Fragment key={`im-${idx}-${rowIdx}`}>
                        <div
                          className="sp-row sp-row--manager"
                        >
                          <div
                            className="sp-pill"
                            onDoubleClick={() =>
                              setEditingPill({ section: "improvements", column: "manager", idx: chunk.start + rowIdx })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {editingPill?.section === "improvements" &&
                            editingPill?.column === "manager" &&
                            editingPill?.idx === chunk.start + rowIdx ? (
                              <EditablePill
                                value={it.score}
                                onSave={(v) => saveScore("improvements", "manager", chunk.start + rowIdx, v)}
                              />
                            ) : (
                              formatScore(it.score)
                            )}
                          </div>
                          <div
                            className="sp-card"
                            onDoubleClick={() =>
                              setEditing({ section: "improvements", column: "manager", idx: chunk.start + rowIdx })
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {editing?.section === "improvements" &&
                            editing?.column === "manager" &&
                            editing?.idx === chunk.start + rowIdx ? (
                              <EditableText
                                value={it.text}
                                onSave={(v) => saveText("improvements", "manager", chunk.start + rowIdx, v)}
                                onCancel={() => setEditing(null)}
                              />
                            ) : (
                              it.text
                            )}
                          </div>
                          <button
                            type="button"
                            className="sp-row__add-btn"
                            onClick={() => setAdding({ section: "improvements", column: "manager", idx: chunk.start + rowIdx })}
                            title="Add item"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {adding?.section === "improvements" &&
                        adding?.column === "manager" &&
                        adding?.idx === chunk.start + rowIdx ? (
                          <NewItemRow
                            onSave={(item) =>
                              saveNewItem(
                                "improvements",
                                "manager",
                                item,
                                adding.idx !== undefined ? adding.idx + 1 : undefined
                              )
                            }
                            onCancel={() => setAdding(null)}
                          />
                        ) : null}
                      </Fragment>
                    ))}

                    {adding?.section === "improvements" &&
                    adding?.column === "manager" &&
                    adding?.idx === -1 ? (
                      <NewItemRow
                        onSave={(item) => saveNewItem("improvements", "manager", item, 0)}
                        onCancel={() => setAdding(null)}
                      />
                    ) : null}
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
    improvementsManagerItemsDraft,
    improvementsManagerChunks,
    title,
    strengthsGroupItemsDraft,
    strengthsManagerItemsDraft,
    improvementsGroupItemsDraft,
    editing,
    editingPill,
    adding,
    formatScore,
    saveText,
    saveScore,
    saveNewItem,
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
