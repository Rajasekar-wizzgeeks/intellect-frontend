import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Reorder } from "framer-motion";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/stopDoingPage.scss";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager";

const EditableCell = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="sd-edit-textarea"
    />
  );
};

const EditableTrait = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="sd-trait-edit-textarea"
    />
  );
};

const StopDoingTraits = ({ traits, traitsTitle, traitsSubtitle, onTraitsChange }) => {
  const [editing, setEditing] = useState(null); // { idx }

  return (
    <div className="sd-traits">
      <div className="sd-traits__header">
        <div className="sd-traits__title">{traitsTitle}</div>
        <div className="sd-traits__subtitle">{traitsSubtitle}</div>
        <div className="sd-traits__underline" aria-hidden="true" />
      </div>

      <div
        className="sd-traits__grid"
        role="list"
        aria-label="Most predominant traits"
      >
        {traits.map((t, idx) => (
          <div
            key={`${String(t ?? "")}-${idx}`}
            className={`sd-trait-card sd-trait-card--${idx < 4 ? "lg" : idx < 8 ? "md" : "sm"}`.trim()}
            role="listitem"
            onDoubleClick={() => setEditing({ idx })}
            style={{ cursor: "pointer" }}
          >
            {editing?.idx === idx ? (
              <EditableTrait
                key={idx}
                value={t}
                onSave={(newValue) => {
                  const next = Array.isArray(traits) ? [...traits] : [];
                  const cleaned = String(newValue ?? "").trim();

                  if (!cleaned) {
                    next.splice(idx, 1);
                  } else {
                    next[idx] = newValue;
                  }

                  onTraitsChange(next);
                  setEditing(null);
                }}
              />
            ) : (
              <p className="sd-trait-card-text" title={capitalize(t)}>
                {formatTraitText(t)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StopDoingGrid = ({ title, columns, onColumnsChange, rowOffset = 0 ,lastChunk, renderCell}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }
  const [dragState, setDragState] = useState(() => ({
    colIdx: null,
    valuesByCol: {},
  }));

  const applyReorder = useCallback(
    (colIdx, nextKeys) => {
      onColumnsChange((prevColumns) => {
        const nextColumns = Array.isArray(prevColumns) ? [...prevColumns] : [];
        const prevCol = Array.isArray(nextColumns[colIdx])
          ? [...nextColumns[colIdx]]
          : [];

        const nextValues = Array.isArray(nextKeys)
          ? nextKeys.map((k) => (k ? k.value : ""))
          : [];

        if (!nextValues.length) return prevColumns;

        const sliceStart = Math.max(0, rowOffset);
        const sliceEnd = Math.min(prevCol.length, rowOffset + nextValues.length);
        const sliceLen = Math.max(0, sliceEnd - sliceStart);

        if (!sliceLen) return prevColumns;

        prevCol.splice(sliceStart, sliceLen, ...nextValues.slice(0, sliceLen));

        nextColumns[colIdx] = prevCol;
        return nextColumns;
      });
    },
    [onColumnsChange, rowOffset],
  );

  return (
    <div className="sd-grid"  role="table"  style={{"grid-template-columns": columns.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr",paddingBottom:lastChunk? 50 :0}} aria-label={title}>
      {columns.map((col, colIdx) => {
        const values = Array.isArray(col)
          ? col.map((row, rowIdx) => ({
              key: rowOffset + rowIdx,
              value: String(row ?? ""),
            }))
          : [];

        const bufferedValues =
          dragState.colIdx === colIdx && Array.isArray(dragState.valuesByCol[colIdx])
            ? dragState.valuesByCol[colIdx]
            : values;

        return (
          <Reorder.Group
            key={colIdx}
            as="div"
            axis="y"
            values={bufferedValues}
            onReorder={(next) => {
              setDragState((prev) => ({
                colIdx,
                valuesByCol: { ...prev.valuesByCol, [colIdx]: next },
              }));
            }}
            className="sd-col"
            role="rowgroup"
          >
            {bufferedValues.map((row) => {
              const absoluteRowIdx = row.key;
              const localRowIdx = absoluteRowIdx - rowOffset;
              return (
                <Reorder.Item
                  key={`sd-item-${colIdx}-${absoluteRowIdx}`}
                  as="div"
                  value={row}
                  className="sd-row"
                  role="row"
                  style={{ touchAction: "none" }}
                  onDragEnd={() => {
                    setDragState((prev) => {
                      const nextBuffered = prev.valuesByCol?.[colIdx];
                      if (Array.isArray(nextBuffered) && nextBuffered.length) {
                        applyReorder(colIdx, nextBuffered);
                      }
                      return { colIdx: null, valuesByCol: {} };
                    });
                  }}
                >
                  <div
                    className="sd-cell"
                    role="cell"
                    onDoubleClick={() => setEditing({ colIdx, rowIdx: absoluteRowIdx })}
                    style={{ cursor: "grab" }}
                  >
                    {editing?.colIdx === colIdx && editing?.rowIdx === absoluteRowIdx ? (
                      <EditableCell
                        key={`${colIdx}-${absoluteRowIdx}`}
                        value={columns[colIdx]?.[localRowIdx]}
                        onSave={(newValue) => {
                          onColumnsChange((prevColumns) => {
                            const nextColumns = Array.isArray(prevColumns)
                              ? [...prevColumns]
                              : [];
                            if (!nextColumns[colIdx]) nextColumns[colIdx] = [];
                            nextColumns[colIdx] = [...nextColumns[colIdx]];

                            const cleaned = String(newValue ?? "").trim();
                            if (!cleaned) {
                              if (
                                absoluteRowIdx >= 0 &&
                                absoluteRowIdx < nextColumns[colIdx].length
                              ) {
                                nextColumns[colIdx].splice(absoluteRowIdx, 1);
                              }
                            } else {
                              nextColumns[colIdx][absoluteRowIdx] = newValue;
                            }
                            return nextColumns;
                          });
                          setEditing(null);
                        }}
                      />
                    ) : renderCell ? (
                      renderCell({
                        colIdx,
                        rowIdx: localRowIdx,
                        value: columns?.[colIdx]?.[localRowIdx],
                      })
                    ) : (
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {String(columns?.[colIdx]?.[localRowIdx] ?? "")}
                      </ReactMarkdown>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        );
      })}
    </div>
  );
};

const capitalize = (value) => {
  if (typeof value !== "string") return value;
  if (!value.length) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatTraitText = (value, maxLength = 140) => {
  const full = capitalize(value || "");
  if (full.length <= maxLength) return full;
  return `${full.slice(0, maxLength - 1).trimEnd()}…`;
};

const StopDoingPage = ({
  title = "What the Nominee Should “Stop Doing”…",
  columns,
  groups,
  groupIndexMatrix,
  left = [],
  right = [],
  traitsTitle = "Most Predominant Leadership Trait",
  traitsSubtitle = "(Most frequently occurring leadership traits are shown here)",
  traits = [],
  tableFootnote,
  footnote = "* This excludes self feedback ; The larger fonts indicate more number of responses",

}) => {
  const [localColumns, setLocalColumns] = useState(() =>
    Array.isArray(columns) ? columns : [left, right],
  );  

  const serializeGroups = useCallback((g) => {
    const safe = Array.isArray(g)
      ? g.map((row) => ({
          representative_comment: String(row?.representative_comment ?? ""),
          comments_belong_to_this_group: Array.isArray(
            row?.comments_belong_to_this_group,
          )
            ? row.comments_belong_to_this_group.map((c) => String(c ?? ""))
            : [],
        }))
      : [];
    try {
      return JSON.stringify(safe);
    } catch {
      return "";
    }
  }, []);

  const [localGroups, setLocalGroups] = useState(() =>
    Array.isArray(groups) ? groups : [],
  );
  const lastGroupsSerializedRef = useRef(serializeGroups(groups));

  const [rowRanges, setRowRanges] = useState(null);

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  const measurementId = useRef(`stop-doing-${Date.now()}`);

  useEffect(() => {
    if (Array.isArray(columns)) {
      setLocalColumns(columns);
    }
  }, [columns]);

  useEffect(() => {
    const nextSerialized = serializeGroups(groups);
    const prevSerialized = lastGroupsSerializedRef.current;

    if (!nextSerialized || nextSerialized === prevSerialized) return;

    lastGroupsSerializedRef.current = nextSerialized;
    setLocalGroups(Array.isArray(groups) ? groups : []);
  }, [groups, serializeGroups]);

  const maxRows = useMemo(() => {
    if (!Array.isArray(localColumns)) return 0;
    return Math.max(
      0,
      ...localColumns.map((c) => (Array.isArray(c) ? c.length : 0)),
    );
  }, [localColumns]);

  useEffect(() => {
    if (!isBrowser) {
      setRowRanges(null);
      return;
    }

    const pageWidth = 794;
    const pageHeight = 950;
    const pagePadding = 0;

    const measureHeights = async ({ start, end, includeHeader }) => {
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

        const sliceColumns = Array.isArray(localColumns)
          ? localColumns.map((col) =>
              Array.isArray(col) ? col.slice(start, end) : [],
            )
          : [];

        root.render(
          <div className="stop-doing-page">
            {includeHeader ? (
              <FeedbackCommonHeader
                key="sd-hdr"
                title={title}
                titleWidth="100"
                className="sd-header"
              />
            ) : null}
            <div data-measure-grid="1" className="sd-grid-wrapper">
              <StopDoingGrid
                title={title}
                columns={sliceColumns}
                onColumnsChange={setLocalColumns}
                rowOffset={start}
                lastChunk={false}
              />
            </div>
          </div>
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
              resolve({ headerHeightPx: 0, gridHeightPx: 0 });
              return;
            }

            const children = Array.from(content.children);
            const headerEl = includeHeader ? children[0] : null;
            const gridEl = includeHeader ? children[1] : children[0];

            const headerHeightPx = headerEl
              ? Math.ceil(headerEl.getBoundingClientRect().height)
              : 0;
            const gridHeightPx = gridEl
              ? Math.ceil(gridEl.getBoundingClientRect().height)
              : 0;

            resolve({ headerHeightPx, gridHeightPx });
          } catch {
            resolve({ headerHeightPx: 0, gridHeightPx: 0 });
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

    const buildRanges = async () => {
      if (!maxRows) {
        setRowRanges([]);
        return;
      }

      await measurementManager.addToQueue(
        `stop-doing-chunk-${measurementId.current}`,
        async () => {
          const headerOnly = await measureHeights({
            start: 0,
            end: 0,
            includeHeader: true,
          });

          const usableHeightFirst =
            pageHeight - pagePadding * 2 - headerOnly.headerHeightPx;
          const usableHeightOther = pageHeight - pagePadding * 2;

          const ranges = [];
          let start = 0;

          while (start < maxRows) {
            const usableHeight =
              start === 0 ? usableHeightFirst : usableHeightOther;
            let low = 1;
            let high = maxRows - start;
            let best = 1;

            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              const { gridHeightPx } = await measureHeights({
                start,
                end: start + mid,
                includeHeader: false,
              });

              if (gridHeightPx > 0 && gridHeightPx <= usableHeight) {
                best = mid;
                low = mid + 1;
              } else {
                high = mid - 1;
              }
            }

            ranges.push({ start, end: start + best });
            start += best;
          }

          setRowRanges(ranges);
        }
      );
    };

    buildRanges();

    return () => {
      measurementManager.removeFromQueue(
        `stop-doing-chunk-${measurementId.current}`
      );
    };
  }, [isBrowser, localColumns, maxRows, title]);

  const [localTraits, setLocalTraits] = useState(traits);

  useEffect(() => {
    setLocalTraits(traits);
  }, [traits]);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);

    out.push(
      <FeedbackCommonHeader key="sd-hdr" title={title} titleWidth="100" className="sd-header" />,
    );
  
    if (hasColumns) {
      const rangesToUse = Array.isArray(rowRanges) && rowRanges.length
        ? rowRanges
        : [{ start: 0, end: maxRows }];

      rangesToUse.forEach((range, idx) => {
        const chunkColumns = localColumns.map((col) =>
          Array.isArray(col) ? col.slice(range.start, range.end) : [],
        );

        out.push(
          <div key={`sd-grid-wrap-${idx}`} className="sd-grid-wrapper">
            <StopDoingGrid
              key={`sd-grid-${idx}`}
              title={title}
              columns={chunkColumns}
              onColumnsChange={setLocalColumns}
              rowOffset={range.start}
              lastChunk={idx === rangesToUse.length - 1}
              renderCell={
                Array.isArray(localGroups) && Array.isArray(groupIndexMatrix)
                  ? ({ colIdx, rowIdx, value }) => {
                      const raw = String(value ?? "");
                      // Match the main text and the existing (xN) suffix
                      const match = raw.match(/^(.*?)(\(x\d+\)\s*)$/i);
                      const grpIdx = groupIndexMatrix?.[colIdx]?.[range.start + rowIdx];
                      
                      const hasDynamicGroup = typeof grpIdx === "number" &&
                        grpIdx >= 0 &&
                        grpIdx < localGroups.length;

                      if (!hasDynamicGroup) {
                        return (
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {raw}
                          </ReactMarkdown>
                        );
                      }

                      const list = Array.isArray(
                        localGroups?.[grpIdx]?.comments_belong_to_this_group,
                      )
                        ? localGroups[grpIdx].comments_belong_to_this_group
                        : [];

                      return (
                        <span className="cd-group-cell">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {match ? String(match[1] ?? "").trim() : raw}
                          </ReactMarkdown>
                        </span>
                      );
                    }
                  : undefined
              }
            />
            {idx === rangesToUse.length - 1 && tableFootnote ? (
              <div className="sd-footnote">{tableFootnote}</div>
            ) : null}
          </div>,
        );
      });
    }

    out.push(
      <div className="sd-traits-container">
      <StopDoingTraits
        key="sd-traits"
        traits={localTraits}
        traitsTitle={traitsTitle}
        traitsSubtitle={traitsSubtitle}
        onTraitsChange={setLocalTraits}
      />
      <div key="sd-foot" className="sd-footnote">
        {footnote}
      </div>
      </div>
    );

 

    return out;
  }, [
    footnote,
    localColumns,
    maxRows,
    rowRanges,
    title,
    localTraits,
    traitsSubtitle,
    traitsTitle,
  ]);

  return (
    // <div className="section-page-container">
    <>
      <AutoPaginatedSections
        blocks={blocks}
        pageWidth={794}
        pageHeight={950}
        pagePadding={0}
        contentClassName="stop-doing-page"
        componentId="stop-doing"
      />
    </>
    // </div>
  );
};

export default StopDoingPage;
