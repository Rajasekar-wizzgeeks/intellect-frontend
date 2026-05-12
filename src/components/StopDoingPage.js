import React, { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Reorder } from "framer-motion";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/stopDoingPage.scss";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager";
import GroupCommentsModal from "./GroupCommentsModal";

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
      rows={6}
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
      rows={6}
      className="sd-trait-edit-textarea"
    />
  );
};

const StopDoingTraits = ({ traits, traitsTitle, traitsSubtitle, onTraitsChange }) => {
  const [editing, setEditing] = useState(null); // { idx }
  const [addingNew, setAddingNew] = useState(false);

  const allowAddTrait = traitsTitle === "Predominant Leadership Trait";

  return (
    <div className="sd-traits">
      <div className="sd-traits__header">
        <div className="sd-traits__title">{traitsTitle}</div>
        <div className="sd-traits__subtitle">{traitsSubtitle}</div>
        {allowAddTrait ? (
          <button
            type="button"
            className="sd-traits__add-btn"
            onClick={() => setAddingNew(true)}
            title="Add trait"
          >
            <Plus size={16} />
          </button>
        ) : null}
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

        {allowAddTrait && addingNew ? (
          <div
            key="sd-trait-new"
            className="sd-trait-card sd-trait-card--sm"
            role="listitem"
            style={{ cursor: "pointer" }}
          >
            <EditableTrait
              value={""}
              onSave={(newValue) => {
                const cleaned = String(newValue ?? "").trim();
                if (cleaned) {
                  const next = Array.isArray(traits) ? [...traits] : [];
                  next.push(cleaned);
                  onTraitsChange(next);
                }
                setAddingNew(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

const StopDoingGrid = ({
  title,
  columns,
  onColumnsChange,
  rowOffset = 0,
  lastChunk,
  renderCell,
  onCellClick,
  getGroupForCell,
  setMeasureTick,
}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }
  const [addingTo, setAddingTo] = useState(null); // { colIdx, rowIdx }
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
              const isAddingHere =
                addingTo?.colIdx === colIdx && addingTo?.rowIdx === absoluteRowIdx;

              return (
                <Fragment key={`sd-frag-${colIdx}-${absoluteRowIdx}`}>
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
                      onClick={() => {
                        if (onCellClick) {
                          onCellClick({
                            colIdx,
                            rowIdx: absoluteRowIdx,
                            value: columns?.[colIdx]?.[localRowIdx],
                          });
                        }
                      }}
                      style={{ cursor: "pointer" }}
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
                            setMeasureTick?.((t) => t + 1);
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

                    {(() => {
                      const group = getGroupForCell?.(colIdx, absoluteRowIdx);
                      const hasGroupComments =
                        Array.isArray(group?.comments_belong_to_this_group) &&
                        group.comments_belong_to_this_group.length > 0;

                      if (hasGroupComments) return null;

                      return (
                        <button
                          type="button"
                          className="cd-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTo({ colIdx, rowIdx: absoluteRowIdx });
                          }}
                          title="Add similar comment"
                        >
                          <Plus size={14} />
                        </button>
                      );
                    })()}
                  </Reorder.Item>

                  {isAddingHere ? (
                    <div className="sd-row" role="row">
                      <div className="sd-cell" role="cell">
                        <EditableCell
                          value={""}
                          onSave={(val) => {
                            const cleaned = String(val ?? "").trim();
                            if (cleaned) {
                              onColumnsChange((prevColumns) => {
                                const nextColumns = Array.isArray(prevColumns)
                                  ? [...prevColumns]
                                  : [];

                                if (!Array.isArray(nextColumns[colIdx])) {
                                  nextColumns[colIdx] = [];
                                } else {
                                  nextColumns[colIdx] = [...nextColumns[colIdx]];
                                }

                                const insertAt = Math.min(
                                  Math.max(0, absoluteRowIdx + 1),
                                  nextColumns[colIdx].length,
                                );
                                nextColumns[colIdx].splice(insertAt, 0, cleaned);
                                return nextColumns;
                              });
                              setMeasureTick?.((t) => t + 1);
                            }
                            setAddingTo(null);
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </Fragment>
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
  subtitle,
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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupColIdx, setSelectedGroupColIdx] = useState(null);
  const [measureTick, setMeasureTick] = useState(0);

  const serializeColumns = useCallback((cols) => {
    const safe = Array.isArray(cols)
      ? cols.map((col) =>
          Array.isArray(col) ? col.map((c) => String(c ?? "")) : [],
        )
      : [];
    try {
      return JSON.stringify(safe);
    } catch {
      return "";
    }
  }, []);

  const lastColumnsSerializedRef = useRef(serializeColumns(columns));

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
    const nextSerialized = serializeColumns(columns);
    const prevSerialized = lastColumnsSerializedRef.current;

    if (!nextSerialized || nextSerialized === prevSerialized) return;

    lastColumnsSerializedRef.current = nextSerialized;
    if (Array.isArray(columns)) {
      setLocalColumns(columns);
    }
  }, [columns, serializeColumns]);

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
  }, [isBrowser, localColumns, maxRows, title, measureTick]);

  const [localTraits, setLocalTraits] = useState(traits);

  useEffect(() => {
    setLocalTraits(traits);
  }, [traits]);

  const updateGroupData = useCallback((updatedGroup, oldRepComment) => {
    setLocalGroups((prev) => {
      const next = [...prev];
      const idx = next.findIndex(
        (g) => g.representative_comment === (oldRepComment || updatedGroup.representative_comment)
      );
      if (idx !== -1) {
        next[idx] = updatedGroup;
      }
      return next;
    });

    // Sync back to localColumns so it reflects in the table
    if (oldRepComment && updatedGroup.representative_comment !== oldRepComment) {
      setLocalColumns((prevCols) => {
        return prevCols.map((col) => {
          if (!Array.isArray(col)) return col;
          return col.map((cell) => {
            const raw = String(cell ?? "");
            const match = raw.match(/^(.*?)(\(x\d+\)\s*)$/i);
            const baseText = match ? match[1].trim() : raw.trim();
            
            if (baseText === oldRepComment.trim()) {
              return match ? `${updatedGroup.representative_comment} ${match[2]}` : updatedGroup.representative_comment;
            }
            return cell;
          });
        });
      });
    }

    setSelectedGroup(updatedGroup);
  }, []);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);
  
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
            {idx === 0 ? (
              <FeedbackCommonHeader
                key="sd-hdr"
                title={title}
                titleWidth="100"
                className="sd-header"
              />
            ) : null}
            <StopDoingGrid
              key={`sd-grid-${idx}`}
              title={title}
              columns={chunkColumns}
              onColumnsChange={setLocalColumns}
              rowOffset={range.start}
              setMeasureTick={setMeasureTick}
              getGroupForCell={
                Array.isArray(localGroups) &&
                Array.isArray(groupIndexMatrix)
                  ? (colIdx, absoluteRowIdx) => {
                      const grpIdx = groupIndexMatrix?.[colIdx]?.[absoluteRowIdx];
                      if (
                        typeof grpIdx === "number" &&
                        grpIdx >= 0 &&
                        grpIdx < localGroups.length
                      ) {
                        return localGroups[grpIdx];
                      }
                      return null;
                    }
                  : undefined
              }
              onCellClick={
                Array.isArray(localGroups) &&
                Array.isArray(groupIndexMatrix)
                  ? ({ colIdx, rowIdx }) => {
                      const grpIdx =
                        groupIndexMatrix?.[colIdx]?.[rowIdx];
                      if (
                        typeof grpIdx === "number" &&
                        grpIdx >= 0 &&
                        grpIdx < localGroups.length
                      ) {
                        const group = localGroups[grpIdx];
                        if (
                          Array.isArray(group?.comments_belong_to_this_group) &&
                          group.comments_belong_to_this_group.length > 0
                        ) {
                          setSelectedGroup(group);
                          setSelectedGroupColIdx(colIdx);
                        }
                      }
                    }
                  : undefined
              }
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
    } else {
      out.push(
        <FeedbackCommonHeader
          key="sd-hdr"
          title={title}
          titleWidth="100"
          className="sd-header"
        />,
      );
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
    groupIndexMatrix,
    localGroups,
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
      <GroupCommentsModal
        isOpen={!!selectedGroup}
        onClose={() => {
          setSelectedGroup(null);
          setSelectedGroupColIdx(null);
        }}
        selectedGroup={selectedGroup}
        onUpdateGroup={updateGroupData}
        columnCount={Array.isArray(localColumns) ? localColumns.length : 0}
        onMoveComment={(commentIdx, targetColumnIdx) => {
          if (!selectedGroup) return;

          const list = Array.isArray(selectedGroup?.comments_belong_to_this_group)
            ? selectedGroup.comments_belong_to_this_group
            : [];

          if (commentIdx == null || commentIdx < 0 || commentIdx >= list.length) return;
          const moved = String(list[commentIdx] ?? "");
          if (!String(moved).trim()) return;

          const nextComments = list.filter((_, i) => i !== commentIdx);
          const updatedGroup = {
            ...selectedGroup,
            comments_belong_to_this_group: nextComments,
          };

          // Update group first
          updateGroupData(updatedGroup);
          setSelectedGroup(updatedGroup);

          // Append to end of the selected column (fallback to last column)
          setLocalColumns((prevColumns) => {
            const nextColumns = Array.isArray(prevColumns) ? [...prevColumns] : [];
            if (nextColumns.length === 0) return nextColumns;
            
            const fallbackIdx = nextColumns.length - 1;
            const colIdx =
              typeof targetColumnIdx === "number" &&
              targetColumnIdx >= 0 &&
              targetColumnIdx < nextColumns.length
                ? targetColumnIdx
                : fallbackIdx;

            if (!Array.isArray(nextColumns[colIdx])) nextColumns[colIdx] = [];

            nextColumns[colIdx] = [...nextColumns[colIdx], moved];
            return nextColumns;
          });

          // Force pagination ranges to rebuild so the newly appended row is included
          setRowRanges(null);
          setMeasureTick((t) => t + 1);
        }}
      />
    </>
    // </div>
  );
};

export default StopDoingPage;
