import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/continueDoingPage.scss";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager";

const EditableCell = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
    // else if (e.key === "Escape") {
    //   onCancel();
    // }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="cd-edit-textarea"
    />
  );
};

const EditableIaCell = ({ value, onSave, onCancel }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="cd-edit-textarea"
    />
  );
};

const ContinueDoingGrid = ({
  title,
  columns,
  onColumnsChange,
  rowOffset = 0,
  items,
  setMeasureTick,
}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }

  const rows = useMemo(() => {
    if (Array.isArray(items) && items.length) {
      return items;
    }
    if (!Array.isArray(columns)) return [];
    const out = [];
    columns.forEach((col, colIdx) => {
      if (!Array.isArray(col)) return;
      col.forEach((row, rowIdx) => {
        out.push({ colIdx, rowIdx });
      });
    });
    return out;
  }, [items, columns]);

  return (
    <div className="cd-grid" role="table" aria-label={title}>
      {/* {columns.map((col, colIdx) => (
        <div key={colIdx} className="cd-col" role="rowgroup">
          {col.map((row, rowIdx) => (
            <div key={rowIdx} className="cd-row" role="row">
              <div
                className="cd-cell"
                role="cell"
                onDoubleClick={() => setEditing({ colIdx, rowIdx })}
                style={{ cursor: "pointer" }}
              >
                {editing?.colIdx === colIdx && editing?.rowIdx === rowIdx ? (
                  <EditableCell
                    value={columns[colIdx]?.[rowIdx]}
                    onSave={(newValue) => {
                      const updated = [...columns];
                      const absoluteRowIdx = rowOffset + rowIdx;
                      onColumnsChange((prevColumns) => {
                        const nextColumns = Array.isArray(prevColumns)
                          ? [...prevColumns]
                          : [];
                        if (!nextColumns[colIdx]) nextColumns[colIdx] = [];
                        nextColumns[colIdx] = [...nextColumns[colIdx]];
                        nextColumns[colIdx][absoluteRowIdx] = newValue;
                        return nextColumns;
                      });
                      setEditing(null);
                    }}
                  />
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {String(row ?? "")}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </div>
      ))} */}
      {rows.map((row) => (
        <div key={`${row.colIdx}-${row.rowIdx}`} className="cd-row" role="row">
          <div
            className="cd-cell"
            role="cell"
            onDoubleClick={() =>
              setEditing({ colIdx: row.colIdx, rowIdx: row.rowIdx })
            }
            style={{ cursor: "pointer" }}
          >
            {editing?.colIdx === row.colIdx &&
            editing?.rowIdx === row.rowIdx ? (
              <EditableCell
                value={columns?.[row.colIdx]?.[row.rowIdx]}
                onSave={(newValue) => {
                  const absoluteRowIdx = rowOffset + row.rowIdx;
                  const cleaned = String(newValue ?? "").trim();
                  if (!cleaned) {
                    onColumnsChange((prevColumns) => {
                      const nextColumns = Array.isArray(prevColumns)
                        ? [...prevColumns]
                        : [];
                      if (
                        Array.isArray(nextColumns[row.colIdx]) &&
                        absoluteRowIdx >= 0 &&
                        absoluteRowIdx < nextColumns[row.colIdx].length
                      ) {
                        const updatedCol = [...nextColumns[row.colIdx]];
                        updatedCol.splice(absoluteRowIdx, 1);
                        nextColumns[row.colIdx] = updatedCol;
                      }
                      return nextColumns;
                    });
                  } else {
                    onColumnsChange((prevColumns) => {
                      const nextColumns = Array.isArray(prevColumns)
                        ? [...prevColumns]
                        : [];
                      if (!Array.isArray(nextColumns[row.colIdx])) {
                        nextColumns[row.colIdx] = [];
                      } else {
                        nextColumns[row.colIdx] = [...nextColumns[row.colIdx]];
                      }
                      nextColumns[row.colIdx][absoluteRowIdx] = newValue;
                      return nextColumns;
                    });
                  }
                  setMeasureTick((t) => t + 1);
                  setEditing(null);
                }}
              />
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {String(columns?.[row.colIdx]?.[row.rowIdx] ?? "")}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ContinueDoingPage = ({
  title = "What the Nominee Should “Continue Doing”…",
  columns = [],
  footnote = "* This excludes self feedback",
  immediateActionSummary,
  componentId,
  // continue: shouldReMeasure = false,
}) => {
  const [localColumns, setLocalColumns] = useState(columns);
  const [gridChunks, setGridChunks] = useState(null);
  const [measureTick, setMeasureTick] = useState(0);

  const serializeIaColumns = (cols) => {
    const c = cols || {};
    const safe = {
      continue: Array.isArray(c.continue) ? c.continue : [],
      start: Array.isArray(c.start) ? c.start : [],
      stop: Array.isArray(c.stop) ? c.stop : [],
    };
    try {
      return JSON.stringify(safe);
    } catch {
      return "";
    }
  };

  const [iaColumns, setIaColumns] = useState(() => {
    const cols = immediateActionSummary?.columns;
    return {
      continue: Array.isArray(cols?.continue) ? cols.continue : [],
      start: Array.isArray(cols?.start) ? cols.start : [],
      stop: Array.isArray(cols?.stop) ? cols.stop : [],
    };
  });

  const [iaEditing, setIaEditing] = useState(null); // { key: 'continue'|'start'|'stop', idx: number }

  const iaDirtyRef = useRef(false);
  const lastIaSerializedRef = useRef(
    serializeIaColumns(immediateActionSummary?.columns),
  );

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const measurementId = useRef(`continue-doing-${Date.now()}`);

  const autoPaginatedComponentId = useMemo(() => {
    return componentId || measurementId.current;
  }, [componentId]);

  // useEffect(() => {
  //   if (!shouldReMeasure) return;
  //   const id = setTimeout(() => {
  //     setMeasureTick((t) => t + 1);
  //   }, 10000);
  //   return () => clearTimeout(id);
  // }, [shouldReMeasure]);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  useEffect(() => {
    const cols = immediateActionSummary?.columns;
    const nextSerialized = serializeIaColumns(cols);
    const prevSerialized = lastIaSerializedRef.current;

    if (nextSerialized && nextSerialized !== prevSerialized) {
      lastIaSerializedRef.current = nextSerialized;
      iaDirtyRef.current = false;
    }

    if (iaDirtyRef.current) return;

    setIaColumns({
      continue: Array.isArray(cols?.continue) ? cols.continue : [],
      start: Array.isArray(cols?.start) ? cols.start : [],
      stop: Array.isArray(cols?.stop) ? cols.stop : [],
    });
  }, [immediateActionSummary?.columns]);

  const items = useMemo(() => {
    if (!Array.isArray(localColumns)) return [];
    const out = [];
    localColumns.forEach((col, colIdx) => {
      if (!Array.isArray(col)) return;
      col.forEach((row, rowIdx) => {
        out.push({ colIdx, rowIdx });
      });
    });
    return out;
  }, [localColumns]);

  useEffect(() => {
    if (!isBrowser) {
      setGridChunks(null);
      return;
    }

    const pageWidth = 794;
    const pageHeight = 930;
    const pagePadding = 0;
    const performMeasure = async ({ slice, includeFootnote }) => {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.visibility = "hidden";
        container.style.width = `${pageWidth}px`;
        container.style.left = "-100000px";
        container.style.top = "0";
        container.style.zIndex = "-9999";
        container.style.pointerEvents = "none";
        container.id = `measurement-${measurementId.current}`;

        document.body.appendChild(container);
        const root = createRoot(container);

        root.render(
          <div className="continue-doing-page">
            <FeedbackCommonHeader
              title={title}
              titleWidth="100"
              className="cd-header"
            />
            <div data-measure-block="1">
              <ContinueDoingGrid
                title={title}
                columns={localColumns}
                onColumnsChange={setLocalColumns}
                rowOffset={0}
                items={slice}
                setMeasureTick={setMeasureTick}
              />
              {includeFootnote && footnote ? (
                <div className="cd-footnote">{footnote}</div>
              ) : null}
            </div>
          </div>,
        );

        const measure = async () => {
          try {
            if (document.fonts?.ready) {
              await document.fonts.ready;
            }
            await new Promise((resolveFrame) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(resolveFrame);
                });
              });
            });

            const content = container.firstElementChild;
            if (!content) {
              resolve({ headerHeightPx: 0, blockHeightPx: 0 });
              return;
            }

            const children = Array.from(content.children);
            const headerEl = children[0];
            const blockEl = children[1];
            const headerHeightPx = headerEl
              ? Math.ceil(headerEl.getBoundingClientRect().height)
              : 0;
            const blockHeightPx = blockEl
              ? Math.ceil(blockEl.getBoundingClientRect().height)
              : 0;

            resolve({ headerHeightPx, blockHeightPx });
          } catch {
            resolve({ headerHeightPx: 0, blockHeightPx: 0 });
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
      if (!items.length) {
        setGridChunks([]);
        return;
      }

      await measurementManager.addToQueue(
        `continue-doing-chunk-${measurementId.current}`,
        async () => {
          const initialMeasure = await performMeasure({
            slice: items,
            includeFootnote: !!footnote,
          });

          const headerHeight = initialMeasure.headerHeightPx;
          const usableHeight = pageHeight - pagePadding * 2 - headerHeight;

          if (initialMeasure.blockHeightPx <= usableHeight) {
            setGridChunks([items]);
            return;
          }

          const chunks = [];
          let start = 0;

          while (start < items.length) {
            let low = 1;
            let high = items.length - start;
            let best = 1;

            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              const { blockHeightPx } = await performMeasure({
                slice: items.slice(start, start + mid),
                includeFootnote: start + mid === items.length && !!footnote,
              });

              if (blockHeightPx <= usableHeight && blockHeightPx > 0) {
                best = mid;
                low = mid + 1;
              } else {
                if (mid === 1) {
                  // If even one item doesn't fit, we must include it and move on
                  // otherwise we get stuck in an infinite loop or skip data
                  best = 1;
                  break;
                }
                high = mid - 1;
              }
            }

            chunks.push(items.slice(start, start + best));
            start += best;
          }

          setGridChunks(chunks);
        },
      );
    };

    buildChunks();
    return () => {
      measurementManager.removeFromQueue(
        `continue-doing-chunk-${measurementId.current}`,
      );
    };
  }, [isBrowser, items, localColumns, footnote, title, measureTick]);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);

    //     if (hasColumns) {
    //     const chunksToUse =
    //   Array.isArray(gridChunks) && gridChunks.length ? gridChunks : [items];

    // if (chunksToUse && chunksToUse.length) {
    //         let currentOffset = 0;
    //         chunksToUse.forEach((chunk, chunkIdx) => {
    //           out.push(
    //             <div key={`cd-chunk-wrapper-${chunkIdx}`}>
    //               <ContinueDoingGrid
    //                 key={`cd-grid-${chunkIdx}`}
    //                 title={title}
    //                 columns={localColumns}
    //                 onColumnsChange={setLocalColumns}
    //                 rowOffset={currentOffset}
    //                 items={chunk}
    //               />
    //               {chunkIdx === chunksToUse.length - 1 && footnote && (
    //                 <div className="cd-footnote">{footnote}</div>
    //               )}
    //             </div>,
    //           );
    //           currentOffset += chunk.length;
    //         });
    //       }
    //     }

    if (hasColumns) {
      if (!Array.isArray(gridChunks)) {
        return out; // wait until measurement completes
      }

      const chunksToUse = gridChunks.length ? gridChunks : [items];

      let currentOffset = 0;

      chunksToUse.forEach((chunk, chunkIdx) => {
        out.push(
          <div key={`cd-chunk-wrapper-${chunkIdx}`}>
            <ContinueDoingGrid
              key={`cd-grid-${chunkIdx}`}
              title={title}
              columns={localColumns}
              onColumnsChange={setLocalColumns}
              rowOffset={currentOffset}
              items={chunk}
              setMeasureTick={setMeasureTick}
            />

            {chunkIdx === chunksToUse.length - 1 && footnote && (
              <div className="cd-footnote">{footnote}</div>
            )}
          </div>,
        );

        currentOffset += chunk.length;
      });
    }

    if (immediateActionSummary) {
      const {
        title: iaTitle = "Immediate Action Areas - Summary",
        description = "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
        note = "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
      } = immediateActionSummary;

      const iaCols = iaColumns;

      const saveIaItem = (key, idx, newValue) => {
        const cleaned = String(newValue ?? "").trim();
        iaDirtyRef.current = true;
        setIaColumns((prev) => {
          const next = {
            continue: Array.isArray(prev?.continue) ? [...prev.continue] : [],
            start: Array.isArray(prev?.start) ? [...prev.start] : [],
            stop: Array.isArray(prev?.stop) ? [...prev.stop] : [],
          };

          const list = Array.isArray(next[key]) ? next[key] : [];

          if (idx === -1) {
            if (cleaned) list.push(newValue);
          } else if (!cleaned) {
            if (idx >= 0 && idx < list.length) {
              list.splice(idx, 1);
            }
          } else {
            list[idx] = newValue;
          }

          next[key] = list;
          return next;
        });
      };

      out.push(
        <div key="cd-ia" className="cd-ia">
          {/* <div className="cd-ia__title">{iaTitle}</div>
          <div className="cd-ia__underline" aria-hidden="true" /> */}

          <div className="cd-ia__desc">{description}</div>
          <div className="cd-ia__note">{note}</div>

          <div className="cd-ia__panel" role="table" aria-label={iaTitle}>
            <div className="cd-ia-col" role="rowgroup">
              <div
                className="cd-ia-col__head cd-ia-col__head--continue"
                role="row"
              >
                CONTINUE
              </div>
              <div
                className="cd-ia-col__body cd-ia-col__body--continue"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!Array.isArray(iaCols.continue) || iaCols.continue.length === 0) {
                    setIaEditing({ key: "continue", idx: -1 });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {iaEditing?.key === "continue" && iaEditing?.idx === -1 ? (
                  <EditableIaCell
                    value={""}
                    onSave={(newValue) => {
                      saveIaItem("continue", -1, newValue);
                      setIaEditing(null);
                    }}
                    onCancel={() => setIaEditing(null)}
                  />
                ) : null}

                {iaCols.continue.map((t, i) => (
                  <div
                    key={i}
                    className="cd-ia-bullet"
                    role="row"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIaEditing({ key: "continue", idx: i });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {iaEditing?.key === "continue" && iaEditing?.idx === i ? (
                      <EditableIaCell
                        value={t}
                        onSave={(newValue) => {
                          saveIaItem("continue", i, newValue);
                          setIaEditing(null);
                        }}
                        onCancel={() => setIaEditing(null)}
                      />
                    ) : (
                      <>
                        <span className="cd-ia-bullet__dot" aria-hidden="true">
                          •
                        </span>
                        <span className="cd-ia-bullet__text">{t}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-ia-col" role="rowgroup">
              <div
                className="cd-ia-col__head cd-ia-col__head--start"
                role="row"
              >
                START
              </div>
              <div
                className="cd-ia-col__body cd-ia-col__body--start"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!Array.isArray(iaCols.start) || iaCols.start.length === 0) {
                    setIaEditing({ key: "start", idx: -1 });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {iaEditing?.key === "start" && iaEditing?.idx === -1 ? (
                  <EditableIaCell
                    value={""}
                    onSave={(newValue) => {
                      saveIaItem("start", -1, newValue);
                      setIaEditing(null);
                    }}
                    onCancel={() => setIaEditing(null)}
                  />
                ) : null}

                {iaCols.start.map((t, i) => (
                  <div
                    key={i}
                    className="cd-ia-bullet"
                    role="row"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIaEditing({ key: "start", idx: i });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {iaEditing?.key === "start" && iaEditing?.idx === i ? (
                      <EditableIaCell
                        value={t}
                        onSave={(newValue) => {
                          saveIaItem("start", i, newValue);
                          setIaEditing(null);
                        }}
                        onCancel={() => setIaEditing(null)}
                      />
                    ) : (
                      <>
                        <span className="cd-ia-bullet__dot" aria-hidden="true">
                          •
                        </span>
                        <span className="cd-ia-bullet__text">{t}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-ia-col" role="rowgroup">
              <div className="cd-ia-col__head cd-ia-col__head--stop" role="row">
                STOP
              </div>
              <div
                className="cd-ia-col__body cd-ia-col__body--stop"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!Array.isArray(iaCols.stop) || iaCols.stop.length === 0) {
                    setIaEditing({ key: "stop", idx: -1 });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {iaEditing?.key === "stop" && iaEditing?.idx === -1 ? (
                  <EditableIaCell
                    value={""}
                    onSave={(newValue) => {
                      saveIaItem("stop", -1, newValue);
                      setIaEditing(null);
                    }}
                    onCancel={() => setIaEditing(null)}
                  />
                ) : null}

                {iaCols.stop.map((t, i) => (
                  <div
                    key={i}
                    className="cd-ia-bullet"
                    role="row"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setIaEditing({ key: "stop", idx: i });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {iaEditing?.key === "stop" && iaEditing?.idx === i ? (
                      <EditableIaCell
                        value={t}
                        onSave={(newValue) => {
                          saveIaItem("stop", i, newValue);
                          setIaEditing(null);
                        }}
                        onCancel={() => setIaEditing(null)}
                      />
                    ) : (
                      <>
                        <span className="cd-ia-bullet__dot" aria-hidden="true">
                          •
                        </span>
                        <span className="cd-ia-bullet__text">{t}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
      );
    }

    return out;
  }, [localColumns, footnote, immediateActionSummary, title, gridChunks, iaColumns, iaEditing]);
  const Header = useMemo(() => {
    return () => (
      <FeedbackCommonHeader
        key="cd-hdr"
        title={title}
        titleWidth="100"
        className="cd-header"
      />
    );
  }, [title]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={950}
      pagePadding={0}
      HeaderComponent={Header}
      contentClassName="continue-doing-page"
      componentId={autoPaginatedComponentId}
    />
    // </div>
  );
};

export default ContinueDoingPage;
