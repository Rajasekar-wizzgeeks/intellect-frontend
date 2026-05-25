import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Check, X, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Reorder } from "framer-motion";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/continueDoingPage.scss";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager";
import GroupCommentsModal from "./GroupCommentsModal";

const ImmediateActionSummary = memo(function ImmediateActionSummary({
  immediateActionSummary,
  iaColumns,
  onSaveItem,
}) {
  const [editing, setEditing] = useState(null); 
  const [isStopHeaderEditing, setIsStopHeaderEditing] = useState(false);
  const [stopHeaderText, setStopHeaderText] = useState(
    immediateActionSummary?.stopHeaderText || "WATCH-FORS - SUGGESTIONS TO MINIMIZE",
  );

  if (!immediateActionSummary) return null;

  const {
    title: iaTitle = "Immediate Action Areas - Summary",
    description =
      "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
    note =
      "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
  } = immediateActionSummary;

  const iaCols = iaColumns || { continue: [], start: [], stop: [] };

  return (
    <div key="cd-ia" className="cd-ia">
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
                setEditing({ key: "continue", idx: -1 });
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {editing?.key === "continue" && editing?.idx === -1 ? (
              <EditableIaCell
                value={""}
                onSave={(newValue) => {
                  onSaveItem("continue", -1, newValue);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : null}

            {iaCols.continue?.slice(0,3).map((t, i) => (
              <div
                key={i}
                className="cd-ia-bullet"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing({ key: "continue", idx: i });
                }}
                style={{ cursor: "pointer" }}
              >
                {editing?.key === "continue" && editing?.idx === i ? (
                  <EditableIaCell
                    value={t}
                    onSave={(newValue) => {
                      onSaveItem("continue", i, newValue);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
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
          <div className="cd-ia-col__head cd-ia-col__head--start" role="row">
            START
          </div>
          <div
            className="cd-ia-col__body cd-ia-col__body--start"
            role="row"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!Array.isArray(iaCols.start) || iaCols.start.length === 0) {
                setEditing({ key: "start", idx: -1 });
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {editing?.key === "start" && editing?.idx === -1 ? (
              <EditableIaCell
                value={""}
                onSave={(newValue) => {
                  onSaveItem("start", -1, newValue);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : null}

            {iaCols.start?.slice(0,3).map((t, i) => (
              <div
                key={i}
                className="cd-ia-bullet"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing({ key: "start", idx: i });
                }}
                style={{ cursor: "pointer" }}
              >
                {editing?.key === "start" && editing?.idx === i ? (
                  <EditableIaCell
                    value={t}
                    onSave={(newValue) => {
                      onSaveItem("start", i, newValue);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
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
            className="cd-ia-col__head cd-ia-col__head--stop"
            role="row"
            style={{ textTransform: "capitalize", cursor: "pointer" }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsStopHeaderEditing(true);
            }}
          >
            {isStopHeaderEditing ? (
              <EditableIaCell
                value={stopHeaderText}
                onSave={(newValue) => {
                  setStopHeaderText(String(newValue ?? ""));
                  setIsStopHeaderEditing(false);
                }}
                onCancel={() => setIsStopHeaderEditing(false)}
              />
            ) : (
              stopHeaderText
            )}
          </div>
          <div
            className="cd-ia-col__body cd-ia-col__body--stop"
            role="row"
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (!Array.isArray(iaCols.stop) || iaCols.stop.length === 0) {
                setEditing({ key: "stop", idx: -1 });
              }
            }}
            style={{ cursor: "pointer" }}
          >
            {editing?.key === "stop" && editing?.idx === -1 ? (
              <EditableIaCell
                value={""}
                onSave={(newValue) => {
                  onSaveItem("stop", -1, newValue);
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            ) : null}

            {iaCols.stop?.slice(0,3).map((t, i) => (
              <div
                key={i}
                className="cd-ia-bullet"
                role="row"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditing({ key: "stop", idx: i });
                }}
                style={{ cursor: "pointer" }}
              >
                {editing?.key === "stop" && editing?.idx === i ? (
                  <EditableIaCell
                    value={t}
                    onSave={(newValue) => {
                      onSaveItem("stop", i, newValue);
                      setEditing(null);
                    }}
                    onCancel={() => setEditing(null)}
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
    </div>
  );
});

const EditableCell = ({ value, onSave, onCancel }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
    else if (e.key === "Escape") {
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
      rows={6}
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
      rows={6}
      className="cd-edit-textarea"
    />
  );
};

const ContinueDoingGrid = ({
  title,
  columns,
  onColumnsChange,
  rowOffset = 0,
  setMeasureTick,
  renderCell,
  onCellClick,
  onAddComment,
  getGroupForCell,
  onOpenGroupModal,
}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }
  const [addingTo, setAddingTo] = useState(null); // { colIdx, rowIdx }
  const [activeColumnPicker, setActiveColumnPicker] = useState(null); // { colIdx, rowIdx, value }
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

        const next = Array.isArray(nextKeys) ? nextKeys : [];
        const nextValues = next.map((k) => (k ? k.value : ""));

        if (!nextValues.length) return prevColumns;

        const sliceStart = Math.max(0, rowOffset);
        const sliceEnd = Math.min(prevCol.length, rowOffset + nextValues.length);
        const sliceLen = Math.max(0, sliceEnd - sliceStart);

        if (!sliceLen) return prevColumns;

        prevCol.splice(sliceStart, sliceLen, ...nextValues.slice(0, sliceLen));
        nextColumns[colIdx] = prevCol;
        return nextColumns;
      });

      setMeasureTick?.((t) => t + 1);
    },
    [onColumnsChange, rowOffset, setMeasureTick],
  );

  return (
    <div className="cd-grid" role="table" aria-label={title}>
      {(Array.isArray(columns) ? columns : [[], [], []]).map((col, colIdx) => {
        const safeCol = Array.isArray(col) ? col : [];
        const values = safeCol.map((row, rowIdx) => ({
          key: rowOffset + rowIdx,
          value: String(row ?? ""),
        }));

        const bufferedValues =
          dragState.colIdx === colIdx &&
          Array.isArray(dragState.valuesByCol[colIdx])
            ? dragState.valuesByCol[colIdx]
            : values;

        return (
          <Reorder.Group
            key={`cd-col-${colIdx}`}
            as="div"
            axis="y"
            values={bufferedValues}
            onReorder={(next) => {
              setDragState((prev) => ({
                colIdx,
                valuesByCol: { ...prev.valuesByCol, [colIdx]: next },
              }));
            }}
            className="cd-col"
            role="rowgroup"
          >
            {bufferedValues.map((row) => {
              const absoluteRowIdx = row.key;
              const localRowIdx = absoluteRowIdx - rowOffset;
              const isAddingHere =
                addingTo?.colIdx === colIdx && addingTo?.rowIdx === absoluteRowIdx;

              return (
                <Fragment key={`cd-frag-${colIdx}-${row.key}`}>
                  <Reorder.Item
                    key={`cd-item-${colIdx}-${row.key}`}
                    as="div"
                    value={row}
                    className="cd-row-wrapper"
                    role="none"
                    style={{ touchAction: "none" }}
                    onDragEnd={() => {
                      setDragState((prev) => {
                        const nextBuffered = prev.valuesByCol?.[colIdx];
                        if (
                          Array.isArray(nextBuffered) &&
                          nextBuffered.length
                        ) {
                          applyReorder(colIdx, nextBuffered);
                        }
                        return { colIdx: null, valuesByCol: {} };
                      });
                    }}
                  >
                    <div
                      className="cd-row"
                      role="row"
                    >
                      <div
                        className="cd-cell"
                        role="cell"
                        onDoubleClick={() =>
                          setEditing({ colIdx, rowIdx: absoluteRowIdx })
                        }
                        onClick={() => {
                          if (onCellClick) {
                            onCellClick({
                              colIdx,
                              rowIdx: absoluteRowIdx,
                              value: safeCol?.[localRowIdx],
                            });
                          }
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {editing?.colIdx === colIdx &&
                        editing?.rowIdx === absoluteRowIdx ? (
                          <EditableCell
                            value={safeCol?.[localRowIdx]}
                            onSave={(newValue) => {
                              const cleaned = String(newValue ?? "").trim();
                              if (!cleaned) {
                                onColumnsChange((prevColumns) => {
                                  const nextColumns = Array.isArray(prevColumns)
                                    ? [...prevColumns]
                                    : [];
                                  if (
                                    Array.isArray(nextColumns[colIdx]) &&
                                    absoluteRowIdx >= 0 &&
                                    absoluteRowIdx < nextColumns[colIdx].length
                                  ) {
                                    const updatedCol = [...nextColumns[colIdx]];
                                    updatedCol.splice(absoluteRowIdx, 1);
                                    nextColumns[colIdx] = updatedCol;
                                  }
                                  return nextColumns;
                                });
                              } else {
                                onColumnsChange((prevColumns) => {
                                  const nextColumns = Array.isArray(prevColumns)
                                    ? [...prevColumns]
                                    : [];
                                  if (!Array.isArray(nextColumns[colIdx])) {
                                    nextColumns[colIdx] = [];
                                  } else {
                                    nextColumns[colIdx] = [...nextColumns[colIdx]];
                                  }
                                  nextColumns[colIdx][absoluteRowIdx] = newValue;
                                  return nextColumns;
                                });
                              }
                              setMeasureTick((t) => t + 1);
                              setEditing(null);
                            }}
                          />
                        ) : renderCell ? (
                          renderCell({
                            colIdx,
                            rowIdx: localRowIdx,
                            value: safeCol?.[localRowIdx],
                          })
                        ) : (
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {String(safeCol?.[localRowIdx] ?? "")}
                          </ReactMarkdown>
                        )}
                      </div>
                      <div className="cd-row-actions">
                        {onAddComment && (() => {
                          const group = getGroupForCell?.(colIdx, absoluteRowIdx);
                          const hasGroupComments =
                            Array.isArray(group?.comments_belong_to_this_group) &&
                            group.comments_belong_to_this_group.length > 0;

                          if (hasGroupComments) {
                            return null;
                          }

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

                        <button
                          type="button"
                          className="cd-move-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const value = safeCol?.[localRowIdx];
                            setActiveColumnPicker({
                              colIdx,
                              rowIdx: absoluteRowIdx,
                              value,
                            });
                          }}
                          title="Add this comment to another column"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>

                  {isAddingHere && (
                    <div className="cd-row-wrapper" role="none">
                      <div className="cd-row" role="row">
                        <div className="cd-cell" role="cell">
                          <EditableCell
                            value=""
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
                            onCancel={() => setAddingTo(null)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </Reorder.Group>
        );
      })}

      {activeColumnPicker && (
        <div
          className="cd-group-modal-overlay"
          onClick={() => setActiveColumnPicker(null)}
        >
          <div
            className="cd-group-modal__column-picker"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="cd-group-modal__column-picker-title">
              Which column would you like to add this comment to?
            </div>
            <div className="cd-group-modal__column-picker-actions">
              {(Array.isArray(columns) ? columns : [[], [], []]).map(
                (_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="cd-group-modal__column-picker-btn"
                    onClick={() => {
                      const { colIdx: sourceColIdx, rowIdx: sourceRowIdx, value } = activeColumnPicker;
                      onColumnsChange((prevColumns) => {
                        const nextColumns = Array.isArray(prevColumns)
                          ? [...prevColumns]
                          : [];
                        
                        // 1. Remove from source
                        if (Array.isArray(nextColumns[sourceColIdx])) {
                          const nextSourceCol = [...nextColumns[sourceColIdx]];
                          nextSourceCol.splice(sourceRowIdx, 1);
                          nextColumns[sourceColIdx] = nextSourceCol;
                        }

                        // 2. Add to target
                        if (!Array.isArray(nextColumns[idx])) {
                          nextColumns[idx] = [];
                        } else {
                          nextColumns[idx] = [...nextColumns[idx]];
                        }
                        nextColumns[idx].push(value);
                        
                        return nextColumns;
                      });
                      setMeasureTick?.((t) => t + 1);
                      setActiveColumnPicker(null);
                    }}
                  >
                    {idx + 1}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              className="cd-group-modal__column-picker-cancel"
              onClick={() => setActiveColumnPicker(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ContinueDoingPage = ({
  title = "What the Nominee Should “Continue Doing”…",
  subtitle,
  columns = [],
  groups,
  groupIndexMatrix,
  footnote = "* This excludes self feedback",
  immediateActionSummary,
  componentId,
  // continue: shouldReMeasure = false,
  continue: isContinue = false,
  onDataChange,
}) => {
  const [localColumns, setLocalColumns] = useState(columns);
  const [rowRanges, setRowRanges] = useState(null);
  const [measureTick, setMeasureTick] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupColIdx, setSelectedGroupColIdx] = useState(null);

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

  const iaDirtyRef = useRef(false);
  const lastIaSerializedRef = useRef(
    serializeIaColumns(immediateActionSummary?.columns),
  );

  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  const lastEmittedSigRef = useRef("");
  const localColumnsSig = useMemo(
    () => serializeColumns(localColumns),
    [localColumns, serializeColumns],
  );
  const localGroupsSig = useMemo(
    () => serializeGroups(localGroups),
    [localGroups, serializeGroups],
  );
  const iaColumnsSig = useMemo(() => serializeIaColumns(iaColumns), [iaColumns]);
  const hasImmediateAction = Boolean(immediateActionSummary);

  useEffect(() => {
    const cb = onDataChangeRef.current;
    if (!cb) return;

    const payload = {
      columns: localColumns,
      groups: localGroups,
      ...(hasImmediateAction ? { immediateActionColumns: iaColumns } : {}),
    };

    let sig;
    try {
      sig = JSON.stringify(payload);
    } catch {
      return;
    }
    if (sig === lastEmittedSigRef.current) return;
    lastEmittedSigRef.current = sig;
    cb(payload);
  }, [
    localColumnsSig,
    localGroupsSig,
    iaColumnsSig,
    hasImmediateAction,
    localColumns,
    localGroups,
    iaColumns,
  ]);

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

  const saveIaItem = useCallback((key, idx, newValue) => {
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
  }, []);

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
    const pageHeight = 930;
    const pagePadding = 0;

    const measureHeights = async ({ start, end }) => {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.visibility = "hidden";
        container.style.width = `${pageWidth}px`;
        container.style.left = "-100000px";
        container.style.top = "0";
        container.style.zIndex = "-9999";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);
        const root = createRoot(container);

        const sliceColumns = Array.isArray(localColumns)
          ? localColumns.map((col) =>
              Array.isArray(col) ? col.slice(start, end) : [],
            )
          : [];

        root.render(
          <div className="continue-doing-page">
            <FeedbackCommonHeader
              title={title}
              subtitle={subtitle}
              titleWidth="100"
              className="cd-header"
            />
            <div data-measure-block="1">
              <ContinueDoingGrid
                title={title}
                columns={sliceColumns}
                onColumnsChange={setLocalColumns}
                rowOffset={start}
                setMeasureTick={setMeasureTick}
              />
              {end >= maxRows && footnote ? (
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
                requestAnimationFrame(resolveFrame);
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

        setTimeout(measure, 10);
      });
    };

    const buildRanges = async () => {
      if (!maxRows) {
        setRowRanges([]);
        return;
      }

      await measurementManager.addToQueue(
        `continue-doing-chunk-${measurementId.current}`,
        async () => {
          const initialMeasure = await measureHeights({ start: 0, end: maxRows });
          const headerHeight = initialMeasure.headerHeightPx;
          const usableHeight = pageHeight - pagePadding * 2 - headerHeight;

          if (initialMeasure.blockHeightPx > 0 && initialMeasure.blockHeightPx <= usableHeight) {
            setRowRanges([{ start: 0, end: maxRows }]);
            return;
          }

          const ranges = [];
          let start = 0;

          while (start < maxRows) {
            let low = 1;
            let high = maxRows - start;
            let best = 1;

            while (low <= high) {
              const mid = Math.floor((low + high) / 2);
              const { blockHeightPx } = await measureHeights({
                start,
                end: start + mid,
              });

              if (blockHeightPx > 0 && blockHeightPx <= usableHeight) {
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
        },
      );
    };

    buildRanges();
    return () => {
      measurementManager.removeFromQueue(
        `continue-doing-chunk-${measurementId.current}`,
      );
    };
  }, [isBrowser, localColumns, footnote, title, subtitle, maxRows, measureTick]);

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
            // Check if the cell text (excluding (xN)) matches the old rep comment
            const raw = String(cell ?? "");
            const match = raw.match(/^(.*?)(\(x\d+\)\s*)$/i);
            const baseText = match ? match[1].trim() : raw.trim();
            
            if (baseText === oldRepComment.trim()) {
              // If it matches, replace it with new rep comment, preserving (xN) if present
              return match ? `${updatedGroup.representative_comment} ${match[2]}` : updatedGroup.representative_comment;
            }
            return cell;
          });
        });
      });
    }

    setSelectedGroup(updatedGroup);
  }, []);

  const handleAddComment = useCallback((colIdx, rowIdx, newValue) => {
    if (!newValue?.trim()) return;
    
    const grpIdx = groupIndexMatrix?.[colIdx]?.[rowIdx];
    if (typeof grpIdx === "number" && grpIdx >= 0 && grpIdx < localGroups.length) {
      const group = { ...localGroups[grpIdx] };
      const comments = Array.isArray(group.comments_belong_to_this_group) 
        ? [...group.comments_belong_to_this_group] 
        : [];
      comments.push(newValue);
      group.comments_belong_to_this_group = comments;
      
      updateGroupData(group);
      setMeasureTick(t => t + 1);
    }
  }, [groupIndexMatrix, localGroups, updateGroupData]);

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
      if (!Array.isArray(rowRanges)) {
        return out;
      }

      const rangesToUse = rowRanges.length ? rowRanges : [{ start: 0, end: maxRows }];

      rangesToUse.forEach((range, pageIdx) => {
        const chunkColumns = localColumns.map((col) =>
          Array.isArray(col) ? col.slice(range.start, range.end) : [],
        );
        out.push(
          <div key={`cd-chunk-wrapper-${pageIdx}`}>
            <ContinueDoingGrid
              key={`cd-grid-${pageIdx}`}
              title={title}
              columns={chunkColumns}
              onColumnsChange={setLocalColumns}
              rowOffset={range.start}
              setMeasureTick={setMeasureTick}
              onAddComment={isContinue ? handleAddComment : undefined}
              getGroupForCell={
                isContinue &&
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
              onOpenGroupModal={
                isContinue
                  ? (group) => {
                      if (group) setSelectedGroup(group);
                    }
                  : undefined
              }
              onCellClick={
                isContinue &&
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
              renderCell={
                isContinue &&
                Array.isArray(localGroups) &&
                Array.isArray(groupIndexMatrix)
                  ? ({ colIdx, rowIdx, value }) => {
                      const raw = String(value ?? "");
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

            {pageIdx === rangesToUse.length - 1 && footnote && (
              <div className="cd-footnote">{footnote}</div>
            )}
          </div>,
        );
      });
    }

    if (immediateActionSummary) {
      out.push(
        <ImmediateActionSummary
          immediateActionSummary={immediateActionSummary}
          iaColumns={iaColumns}
          onSaveItem={saveIaItem}
        />,
      );
    }

    return out;
  }, [localColumns, footnote, immediateActionSummary, title, rowRanges, maxRows, iaColumns, saveIaItem, isContinue, localGroups, groupIndexMatrix]);
  const Header = useMemo(() => {
    return () => (
      <FeedbackCommonHeader
        key="cd-hdr"
        title={title}
        subtitle={subtitle}
        titleWidth="100"
        className="cd-header"
      />
    );
  }, [title, subtitle]);

  return (
    // <div className="section-page-container">
    <>
      <AutoPaginatedSections
        blocks={blocks}
        pageWidth={794}
        pageHeight={950}
        pagePadding={0}
        HeaderComponent={Header}
        contentClassName="continue-doing-page"
        componentId={autoPaginatedComponentId}
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

export default ContinueDoingPage;
