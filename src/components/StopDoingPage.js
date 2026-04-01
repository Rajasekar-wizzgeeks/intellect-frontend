import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/stopDoingPage.scss";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import GroupCommentsPopup from "./GroupCommentsPopup";
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
  const [editing, setEditing] = useState(null); // { idx, isNew? }

  const displayTraits = useMemo(() => {
    const base = Array.isArray(traits) ? traits : [];
    const out = base.map((value, actualIdx) => ({
      value,
      actualIdx,
      isVirtual: false,
    }));

    if (editing?.isNew && typeof editing?.idx === "number") {
      const insertAt = Math.min(Math.max(editing.idx, 0), out.length);
      out.splice(insertAt, 0, {
        value: "",
        actualIdx: -1,
        isVirtual: true,
      });
    }
    return out;
  }, [traits, editing]);

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
        {displayTraits.map((it, displayIdx) => (
          <div
            key={`${String(it?.value ?? "")}-${displayIdx}-${it?.isVirtual ? "v" : "r"}`}
            className={`sd-trait-card sd-trait-card--${displayIdx < 4 ? "lg" : displayIdx < 8 ? "md" : "sm"}`.trim()}
            role="listitem"
            onDoubleClick={() => {
              if (it?.isVirtual) return;
              setEditing({ idx: it.actualIdx, isNew: false });
            }}
            style={{ cursor: "pointer" }}
          >
            {(editing?.isNew
              ? it?.isVirtual
              : editing?.idx === it.actualIdx) ? (
              <>
                <EditableTrait
                  key={displayIdx}
                  value={editing?.isNew ? "" : it.value}
                  onSave={(newValue) => {
                    const next = Array.isArray(traits) ? [...traits] : [];
                    const cleaned = String(newValue ?? "").trim();

                    if (editing?.isNew) {
                      if (!cleaned) {
                        setEditing(null);
                        return;
                      }
                      const insertAt = Math.min(
                        Math.max(editing.idx, 0),
                        next.length,
                      );
                      next.splice(insertAt, 0, newValue);
                      onTraitsChange(next);
                      setEditing(null);
                      return;
                    }

                    if (!cleaned) {
                      next.splice(it.actualIdx, 1);
                    } else {
                      next[it.actualIdx] = newValue;
                    }

                    onTraitsChange(next);
                    setEditing(null);
                  }}
                />
                {!editing?.isNew ? (
                  <button
                    type="button"
                    className="sd-trait-add"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      const insertAt = it.actualIdx + 1;
                      setEditing({ idx: insertAt, isNew: true });
                    }}
                    aria-label="Add trait"
                    title="Add trait"
                  >
                    +
                  </button>
                ) : null}
              </>
            ) : (
              <p className="sd-trait-card-text" title={capitalize(it.value)}>
                {formatTraitText(it.value)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StopDoingGrid = ({ title, columns, onColumnsChange, rowOffset = 0 ,lastChunk, renderCell}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx, isNew? }

  return (
    <div className="sd-grid"  role="table"  style={{"grid-template-columns": columns.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr",paddingBottom:lastChunk? 50 :0}} aria-label={title}>
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="sd-col" 
        // style={{borderTop:lastChunk ? 1 : "none" }}
         role="rowgroup">
          {col.map((row, rowIdx) => (
            <div key={rowIdx} className="sd-row" role="row">
              <div
                className="sd-cell"
                role="cell"
                onDoubleClick={() => setEditing({ colIdx, rowIdx, isNew: false })}
                style={{ cursor: "pointer" }}
              >
                {editing?.colIdx === colIdx && editing?.rowIdx === rowIdx ? (
                  <>
                    <EditableCell
                      key={`${colIdx}-${rowIdx}`}
                      value={editing?.isNew ? "" : columns[colIdx]?.[rowIdx]}
                      onSave={(newValue) => {
                        const absoluteRowIdx = rowOffset + rowIdx;
                        const cleaned = String(newValue ?? "").trim();

                        if (editing?.isNew) {
                          if (!cleaned) {
                            setEditing(null);
                            return;
                          }
                          onColumnsChange((prevColumns) => {
                            const nextColumns = Array.isArray(prevColumns)
                              ? [...prevColumns]
                              : [];
                            const col = Array.isArray(nextColumns[colIdx])
                              ? [...nextColumns[colIdx]]
                              : [];
                            const boundedInsertAt = Math.min(
                              Math.max(absoluteRowIdx, 0),
                              col.length,
                            );
                            col.splice(boundedInsertAt, 0, newValue);
                            nextColumns[colIdx] = col;
                            return nextColumns;
                          });
                          setEditing(null);
                          return;
                        }

                        onColumnsChange((prevColumns) => {
                          const nextColumns = Array.isArray(prevColumns)
                            ? [...prevColumns]
                            : [];
                          if (!nextColumns[colIdx]) nextColumns[colIdx] = [];
                          nextColumns[colIdx] = [...nextColumns[colIdx]];

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
                    <button
                      type="button"
                      className="sd-row-add"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        const insertAt = rowIdx + 1;
                        setEditing({ colIdx, rowIdx: insertAt, isNew: true });
                      }}
                      aria-label="Add row"
                      title="Add row"
                    >
                      +
                    </button>
                  </>
                ) : (
                  (renderCell
                    ? renderCell({
                        colIdx,
                        rowIdx,
                        value: columns?.[colIdx]?.[rowIdx],
                      })
                    : (
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {String(row ?? "")}
                        </ReactMarkdown>
                      ))
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
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
  const groupsDirtyRef = useRef(false);
  const lastGroupsSerializedRef = useRef(serializeGroups(groups));

  const [popupGroupIdx, setPopupGroupIdx] = useState(null);

  const popupGroup =
    popupGroupIdx !== null &&
    Array.isArray(localGroups) &&
    popupGroupIdx >= 0 &&
    popupGroupIdx < localGroups.length
      ? localGroups[popupGroupIdx]
      : null;

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
    setPopupGroupIdx(null);
  }, [groups]);

  useEffect(() => {
    const nextSerialized = serializeGroups(groups);
    const prevSerialized = lastGroupsSerializedRef.current;

    if (!nextSerialized || nextSerialized === prevSerialized) return;

    lastGroupsSerializedRef.current = nextSerialized;
    groupsDirtyRef.current = false;
    setLocalGroups(Array.isArray(groups) ? groups : []);
  }, [groups, serializeGroups]);

  const addCommentToPopupGroup = useCallback(
    (text) => {
      if (popupGroupIdx === null) return;
      groupsDirtyRef.current = true;
      setLocalGroups((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const g = next[popupGroupIdx];
        if (!g) return prev;
        const list = Array.isArray(g.comments_belong_to_this_group)
          ? [...g.comments_belong_to_this_group]
          : [];
        list.push(text);
        next[popupGroupIdx] = { ...g, comments_belong_to_this_group: list };
        return next;
      });
    },
    [popupGroupIdx],
  );

  const deleteCommentFromPopupGroup = useCallback(
    (idx) => {
      if (popupGroupIdx === null) return;
      groupsDirtyRef.current = true;
      setLocalGroups((prev) => {
        const next = Array.isArray(prev) ? [...prev] : [];
        const g = next[popupGroupIdx];
        if (!g) return prev;
        const list = Array.isArray(g.comments_belong_to_this_group)
          ? [...g.comments_belong_to_this_group]
          : [];
        if (idx >= 0 && idx < list.length) list.splice(idx, 1);
        next[popupGroupIdx] = { ...g, comments_belong_to_this_group: list };
        return next;
      });
    },
    [popupGroupIdx],
  );

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
                      
                      const countText = list.length > 0 ? `(x${list.length})` : "";

                      return (
                        <span className="cd-group-cell">
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {match ? String(match[1] ?? "").trim() : raw}
                          </ReactMarkdown>
                          {countText && (
                            <button
                              type="button"
                              className="cd-xcount-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPopupGroupIdx(grpIdx);
                              }}
                            >
                              {countText}
                            </button>
                          )}
                        </span>
                      );
                    }
                  : undefined
              }
            />
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
      <GroupCommentsPopup
        open={popupGroupIdx !== null}
        group={popupGroup}
        onClose={() => setPopupGroupIdx(null)}
        onAddComment={addCommentToPopupGroup}
        onDeleteComment={deleteCommentFromPopupGroup}
        itemStyle={{ display: 'flex' }}
      />
    </>
    // </div>
  );
};

export default StopDoingPage;
