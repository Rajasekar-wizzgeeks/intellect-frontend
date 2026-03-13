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

        const Header = () => (
          <FeedbackCommonHeader
            key="cd-hdr"
            title={title}
            titleWidth="100"
            className="cd-header"
          />
        );

        root.render(
          <div className="continue-doing-page">
            <Header />
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
        return;
      }

      await measurementManager.addToQueue(
        `continue-doing-chunk-${measurementId.current}`,
        async () => {
          const headerMeasure = await performMeasure({
            slice: items.slice(0, 1),
            includeFootnote: false,
          });

          const headerHeight = headerMeasure.headerHeightPx;
          const usableHeight = pageHeight - pagePadding * 2 - headerHeight;

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
                includeFootnote: false,
              });

              if (blockHeightPx <= usableHeight && blockHeightPx > 0) {
                best = mid;
                low = mid + 1;
              } else {
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
  }, [isBrowser, items, localColumns, footnote, title]);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);

    if (hasColumns) {
      const chunksToUse =
        Array.isArray(gridChunks) && gridChunks.length ? gridChunks : null;

      if (chunksToUse) {
        chunksToUse.forEach((chunk, chunkIdx) => {
          out.push(
            <ContinueDoingGrid
              key={`cd-grid-${chunkIdx}`}
              title={title}
              columns={localColumns}
              onColumnsChange={setLocalColumns}
              rowOffset={0}
              items={chunk}
            />,
          );
        });
      } else {
        out.push(
          <ContinueDoingGrid
            key="cd-grid"
            title={title}
            columns={localColumns}
            onColumnsChange={setLocalColumns}
            rowOffset={0}
          />,
        );
      }
    }

    if (footnote) {
      out.push(
        <div key="cd-foot" className="cd-footnote">
          {footnote}
        </div>,
      );
    }

    // if (footnote) {
    //   out.push(

    //   );
    // }

    if (immediateActionSummary) {
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

    return out;
  }, [localColumns, footnote, immediateActionSummary, title, gridChunks]);

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
      componentId="continue-doing"
    />
    // </div>
  );
};

export default ContinueDoingPage;
