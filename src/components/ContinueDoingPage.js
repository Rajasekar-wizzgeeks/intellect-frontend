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

const ContinueDoingGrid = ({
  title,
  columns,
  onColumnsChange,
  rowOffset = 0,
  items,
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
}) => {
  const [localColumns, setLocalColumns] = useState(columns);
  const [gridChunks, setGridChunks] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(true);

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const measurementId = useRef(`continue-doing-${Date.now()}`);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const items = useMemo(() => {
    if (!Array.isArray(localColumns)) return [];
    const out = [];
    localColumns.forEach((col, colIdx) => {
      if (!Array.isArray(col)) return;
      col.forEach((row, rowIdx) => {
        if (row && String(row).trim()) {
          out.push({ colIdx, rowIdx });
        }
      });
    });
    return out;
  }, [localColumns]);

  const hasContent = useMemo(() => {
    const hasColumnsContent =
      Array.isArray(localColumns) &&
      localColumns.some(
        (col) =>
          Array.isArray(col) &&
          col.some((cell) => cell && String(cell).trim()),
      );

    const iaCols = immediateActionSummary?.columns;
    const hasImmediateActionContent =
      !!immediateActionSummary &&
      ((Array.isArray(iaCols?.continue) && iaCols.continue.length > 0) ||
        (Array.isArray(iaCols?.start) && iaCols.start.length > 0) ||
        (Array.isArray(iaCols?.stop) && iaCols.stop.length > 0));

    return hasColumnsContent || hasImmediateActionContent;
  }, [localColumns, immediateActionSummary]);

  useEffect(() => {
    if (!isBrowser || !hasContent) {
      setGridChunks([]);
      setIsMeasuring(false);
      return;
    }

    setIsMeasuring(true);

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
        setIsMeasuring(false);
        return;
      }

      await measurementManager.addToQueue(
        `continue-doing-chunk-${measurementId.current}`,
        async () => {
          try {
            const initialMeasure = await performMeasure({
              slice: items,
              includeFootnote: !!footnote,
            });

            const headerHeight = initialMeasure.headerHeightPx || 0;
            const usableHeight = pageHeight - pagePadding * 2 - headerHeight;

            if (
              initialMeasure.blockHeightPx > 0 &&
              initialMeasure.blockHeightPx <= usableHeight
            ) {
              setGridChunks([items]);
              return;
            }

            const chunks = [];
            let start = 0;

            while (start < items.length) {
              let low = 1;
              let high = items.length - start;
              let best = 0;

              while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const isLastChunk = start + mid === items.length;
                const { blockHeightPx } = await performMeasure({
                  slice: items.slice(start, start + mid),
                  includeFootnote: isLastChunk && !!footnote,
                });

                if (blockHeightPx > 0 && blockHeightPx <= usableHeight) {
                  best = mid;
                  low = mid + 1;
                } else {
                  high = mid - 1;
                }
              }

              if (best === 0) {
                best = 1;
              }

              const chunk = items.slice(start, start + best);
              if (chunk.length) {
                chunks.push(chunk);
              }
              start += best;
            }

            setGridChunks(chunks);
          } finally {
            setIsMeasuring(false);
          }
        },
      );
    };

    buildChunks();

    return () => {
      measurementManager.removeFromQueue(
        `continue-doing-chunk-${measurementId.current}`,
      );
    };
  }, [isBrowser, hasContent, items, localColumns, footnote, title]);

  const blocks = useMemo(() => {
    const out = [];

    if (!hasContent) return out;

    const hasColumnsContent =
      Array.isArray(localColumns) &&
      localColumns.some(
        (col) =>
          Array.isArray(col) &&
          col.some((cell) => cell && String(cell).trim()),
      );

    if (hasColumnsContent) {
      const chunksToUse = Array.isArray(gridChunks)
        ? gridChunks.filter((c) => Array.isArray(c) && c.length)
        : null;

      if (chunksToUse && chunksToUse.length) {
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
              />
              {chunkIdx === chunksToUse.length - 1 && footnote && (
                <div className="cd-footnote">{footnote}</div>
              )}
            </div>,
          );
          currentOffset += chunk.length;
        });
      } else {
        out.push(
          <div key="cd-initial-render">
            <ContinueDoingGrid
              title={title}
              columns={localColumns}
              onColumnsChange={setLocalColumns}
              items={items}
            />
            {footnote && <div className="cd-footnote">{footnote}</div>}
          </div>,
        );
      }
    }

    if (immediateActionSummary) {
      const hasImmediateActionContent =
        immediateActionSummary.columns?.continue?.length > 0 ||
        immediateActionSummary.columns?.start?.length > 0 ||
        immediateActionSummary.columns?.stop?.length > 0;

      if (hasImmediateActionContent) {
        const {
          title: iaTitle = "Immediate Action Areas - Summary",
          description = "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
          note = "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
          columns: iaCols = {
            continue: [],
            start: [],
            stop: [],
          },
        } = immediateActionSummary;

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
                >
                  {iaCols.continue.map((t, i) => (
                    <div key={i} className="cd-ia-bullet" role="row">
                      <span className="cd-ia-bullet__dot" aria-hidden="true">
                        •
                      </span>
                      <span className="cd-ia-bullet__text">{t}</span>
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
                >
                  {iaCols.start.map((t, i) => (
                    <div key={i} className="cd-ia-bullet" role="row">
                      <span className="cd-ia-bullet__dot" aria-hidden="true">
                        •
                      </span>
                      <span className="cd-ia-bullet__text">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cd-ia-col" role="rowgroup">
                <div className="cd-ia-col__head cd-ia-col__head--stop" role="row">
                  STOP
                </div>
                <div className="cd-ia-col__body cd-ia-col__body--stop" role="row">
                  {iaCols.stop.map((t, i) => (
                    <div key={i} className="cd-ia-bullet" role="row">
                      <span className="cd-ia-bullet__dot" aria-hidden="true">
                        •
                      </span>
                      <span className="cd-ia-bullet__text">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
        );
      }
    }

    return out;
  }, [hasContent, localColumns, footnote, immediateActionSummary, title, gridChunks, items]);

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

  if (!hasContent && !isMeasuring) {
    return null;
  }

  if (!blocks.length && !isMeasuring) {
    return null;
  }

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={950}
      pagePadding={0}
      HeaderComponent={Header}
      contentClassName="continue-doing-page"
      componentId="continue-doing"
    />
  );
};

export default ContinueDoingPage;
