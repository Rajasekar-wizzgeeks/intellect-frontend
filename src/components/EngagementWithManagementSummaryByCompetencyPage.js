import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyThreeBarChart from "./CompetencyThreeBarChart";
import ComparisonTable from "./ComparisonTable";
import "../styles/summaryByCompetencyPage.scss";
import AutoPaginatedPptSections from "./AutoPaginatedPptSections";

const LEGEND_2 = [
  {
    key: "managerRating",
    label: "Manager Rating",
    color: "var(--chart-series-manager-rating)",
  },
  {
    key: "selfRating",
    label: "Self Rating",
    color: "var(--chart-series-self-rating)",
  },
];

const formatOverallScore = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n.toFixed(1).replace(/\.0$/, "");
};

const EngagementWithManagementSummaryByCompetencyPage = ({
  title = "Summary by Competency – Engagement With Management",
  overallScore = 4.5,
  items = [],
  barHeight = 12,
  comparisonTitle = "Comparison of Average Scores – 2024 Vs 2025",
  comparisonAverage,
  managerComparisonAverage,
  showComparisonTable = true,
  comparisonNotes = [
    "The table highlights areas where there is a slight increase or decrease in scores compared to last year. Only those areas with an increase or decrease above 0.1 in Team Score are shown, while differences smaller than those indicated have been excluded.",
  ],
  comparisonRows = [
    {
      label:
        "Facilitates opportunities for teachers to transfer and mentor other teachers on best practices",
      diff: 0.19,
    },
    {
      label:
        "Provides opportunities for career/professional development and growth",
      diff: 0.17,
    },
    {
      label: "Helps in resolving issues/remove roadblocks in the job",
      diff: 0.13,
    },
    {
      label: "Handles ambiguous situations well",
      diff: 0.13,
    },
    {
      label: "Makes one feel valued as an individual",
      diff: 0.13,
    },
    {
      label: "Has created a work culture that rewards merit",
      diff: -0.12,
    },
    {
      label: "Has created a high performing culture in the team/school",
      diff: -0.2,
    },
  ],
  setAverageCompentency,
  onDataChange,
  file2Year,
  file3Year,
  currentYear,
  totalResponse = {
    total: 1,
    Self: 0,
    Manager: 0,
    Subordinates: 0,
  },
}) => {
  const [localOverallScore, setLocalOverallScore] = useState(overallScore);
  const [rows, setRows] = useState(items);
  const [localComparisonAverage, setLocalComparisonAverage] = useState(comparisonAverage);
  const [localManagerComparisonAverage, setLocalManagerComparisonAverage] = useState(
    managerComparisonAverage,
  );
  const [localComparisonNotes, setLocalComparisonNotes] = useState(comparisonNotes);
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const editingNoteDraftRef = useRef("");

  const lastOverallScoreRef = useRef(undefined);
  const lastItemsSigRef = useRef("");
  const lastComparisonAvgSigRef = useRef("");
  const lastManagerComparisonAvgSigRef = useRef("");
  const lastComparisonNotesSigRef = useRef("");

  const normalizeAverageMap = useCallback((src) => {
    if (!src) return {};
    if (Array.isArray(src)) {
      const out = {};
      src.forEach((it) => {
        const label = it?.label || it?.question || it?.name;
        if (!label) return;
        out[label] = it;
      });
      return out;
    }
    if (typeof src === "object") return src;
    return {};
  }, []);

  useEffect(() => {
    const next = overallScore;
    if (lastOverallScoreRef.current !== next) {
      lastOverallScoreRef.current = next;
      setLocalOverallScore(next);
    }
  }, [overallScore]);

  useEffect(() => {
    const sig = (() => {
      try {
        return JSON.stringify(items ?? []);
      } catch {
        return "";
      }
    })();
    if (lastItemsSigRef.current !== sig) {
      lastItemsSigRef.current = sig;
      setRows(items ?? []);
    }
  }, [items]);

  useEffect(() => {
    const normalized = normalizeAverageMap(comparisonAverage);
    const sig = (() => {
      try {
        return JSON.stringify(normalized ?? null);
      } catch {
        return "";
      }
    })();
    if (lastComparisonAvgSigRef.current !== sig) {
      lastComparisonAvgSigRef.current = sig;
      setLocalComparisonAverage(normalized);
    }
  }, [comparisonAverage, normalizeAverageMap]);

  useEffect(() => {
    const normalized = normalizeAverageMap(managerComparisonAverage);
    const sig = (() => {
      try {
        return JSON.stringify(normalized ?? null);
      } catch {
        return "";
      }
    })();
    if (lastManagerComparisonAvgSigRef.current !== sig) {
      lastManagerComparisonAvgSigRef.current = sig;
      setLocalManagerComparisonAverage(normalized);
    }
  }, [managerComparisonAverage, normalizeAverageMap]);

  useEffect(() => {
    const sig = (() => {
      try {
        const filtered = (comparisonNotes ?? []).filter(n => n && String(n).trim().length > 0);
        return JSON.stringify(filtered);
      } catch {
        return "";
      }
    })();
    if (lastComparisonNotesSigRef.current !== sig) {
      lastComparisonNotesSigRef.current = sig;
      const filtered = (comparisonNotes ?? []).filter(n => n && String(n).trim().length > 0);
      setLocalComparisonNotes(filtered);
    }
  }, [comparisonNotes]);

  const onDataChangeRef = useRef(onDataChange);
  const lastEmittedSigRef = useRef("");
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  const emitDataChange = useCallback(
    (patch = {}) => {
      const cb = onDataChangeRef.current;
      if (!cb) return;
      const payload = {
        engagement_with_management_competency: patch.engagement_with_management_competency ?? rows,
        comparision_average: patch.comparision_average ?? localComparisonAverage,
        manager_comparision_average:
          patch.manager_comparision_average ?? localManagerComparisonAverage,
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
    },
    [rows, localComparisonAverage, localManagerComparisonAverage],
  );

  const handleCellBlur = useCallback((rowIndex, fieldKey, newValue, label) => {
    const numValue = Number(newValue);
    const updatedComparison = { ...normalizeAverageMap(localComparisonAverage) };
    const targetLabel = label;

    if (targetLabel) {
      if (typeof updatedComparison[targetLabel] === "object") {
        updatedComparison[targetLabel] = {
          ...updatedComparison[targetLabel],
          [fieldKey]: numValue,
        };
      } else {
        updatedComparison[targetLabel] = numValue;
      }
      setLocalComparisonAverage(updatedComparison);
      emitDataChange({ comparision_average: updatedComparison });
    }
  }, [localComparisonAverage, normalizeAverageMap, emitDataChange]);

  const handleNoteCommit = useCallback((noteIndex, value) => {
    const nextValue = String(value ?? "");
    setLocalComparisonNotes((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      if (noteIndex < 0 || noteIndex >= next.length) return prev;
      
      next[noteIndex] = nextValue;
      
      return next.filter(n => n && String(n).trim().length > 0);
    });
    setEditingNoteIndex(null);
  }, []);

  const handleAddNoteAfter = useCallback((noteIndex) => {
    const insertAt = Math.max(noteIndex + 1, 0);
    setLocalComparisonNotes((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      const boundedInsertAt = Math.min(insertAt, next.length);
      next.splice(boundedInsertAt, 0, "");
      return next;
    });
    editingNoteDraftRef.current = "";
    setEditingNoteIndex(insertAt);
  }, []);

  const computeOverallFromRows = useCallback((rowsArg) => {
    if (!Array.isArray(rowsArg) || !rowsArg.length) return 0;

    const subCount = Number(totalResponse?.Subordinates) || 0;
    const mgrCount = Number(totalResponse?.Manager) || 0;

    let totalSubScore = 0;
    let totalMgrScore = 0;
    let subQuestionsCount = 0;
    let mgrQuestionsCount = 0;

    rowsArg.forEach((row) => {
      if (row.groupMean !== undefined && row.groupMean !== null && row.groupMean !== -1) {
        totalSubScore += Number(row.groupMean);
        subQuestionsCount += 1;
      }
      if (row.managerRating !== undefined && row.managerRating !== null && row.managerRating !== -1) {
        totalMgrScore += Number(row.managerRating);
        mgrQuestionsCount += 1;
      }
    });

    const avgSub = subQuestionsCount > 0 ? totalSubScore / subQuestionsCount : 0;
    const avgMgr = mgrQuestionsCount > 0 ? totalMgrScore / mgrQuestionsCount : 0;

    let effectiveTotalCount = 0;
    if (subQuestionsCount > 0) effectiveTotalCount += subCount;
    if (mgrQuestionsCount > 0) effectiveTotalCount += mgrCount;

    if (effectiveTotalCount <= 0) return 0;

    const weightedScore = (avgSub * subCount + avgMgr * mgrCount) / effectiveTotalCount;
    return Number(weightedScore.toFixed(2));
  }, [totalResponse]);

  const handleRowsChange = useCallback((newRows) => {
    setRows(newRows);
    setLocalOverallScore(computeOverallFromRows(newRows));
    if (typeof setAverageCompentency === "function") {
      setAverageCompentency((prev) => ({
        ...prev,
        engagement_with_management_competency: newRows,
      }));
    }
    emitDataChange({ engagement_with_management_competency: newRows });
  }, [computeOverallFromRows, setAverageCompentency, emitDataChange]);

  const blocks = useMemo(() => {
    const out = [];

    const parsed = rows.map((it) => ({
      ...it,
      managerRating: Number(it.managerRating),
      selfRating: Number(it.selfRating),
    }));

    const computedManagerComparisonRows = (() => {
      const src =
        localManagerComparisonAverage && typeof localManagerComparisonAverage === "object"
          ? localManagerComparisonAverage
          : null;
      if (!src) return [];
      

      const getNumber = (obj, keys) => {
        for (const k of keys) {
          const v = obj?.[k];
          const n = Number(v);
          if (v !== undefined && v !== null && Number.isFinite(n)) return n;
        }
        return NaN;
      };

      const mapEntry = (label, value) => {
        if (!label) return null;

        if (value && typeof value === "object") {
          const d1 = getNumber(value, [
            "manager_diff_1",
            "manager_diff1",
            "team_diff1",
            "diff1",
            "diff",
          ]);
          const d2 = getNumber(value, [
            "manager_diff_2",
            "manager_diff2",
            "team_diff2",
            "diff2",
          ]);
          return {
            label,
            team_diff1: d1,
            team_diff2: d2,
          };
        }

        return {
          label,
          team_diff1: Number(value),
        };
      };

      const mapped = (Array.isArray(src) ? src : Object.entries(src))
        .map((entry) => {
          if (Array.isArray(entry)) {
            const [label, value] = entry;
            return mapEntry(label, value);
          }

          const label = entry?.label || entry?.question || entry?.name;
          return mapEntry(label, entry);
        })
        .filter(Boolean)
        .filter(
          (r) =>
            r.label &&
            (Number.isFinite(r.team_diff1) || Number.isFinite(r.team_diff2)),
        );

      mapped.sort((a, b) => {
        const aKey = Number.isFinite(a.team_diff1) ? a.team_diff1 : 0;
        const bKey = Number.isFinite(b.team_diff1) ? b.team_diff1 : 0;
        return bKey - aKey;
      });
      return mapped;
    })();

    const managerHasDiff1 = computedManagerComparisonRows.some((r) =>
      Number.isFinite(Number(r?.team_diff1)),
    );
    const managerHasDiff2 = computedManagerComparisonRows.some((r) =>
      Number.isFinite(Number(r?.team_diff2)),
    );

    const computedComparisonRows = (() => {
      const src =
        localComparisonAverage && typeof localComparisonAverage === "object"
          ? localComparisonAverage
          : null;
      if (!src) {
        return (Array.isArray(comparisonRows) ? comparisonRows : [])
          .map((r) => ({
            label: r?.label,
            team_diff1: Number(r?.diff),
          }))
          .filter((r) => r.label && Number.isFinite(r.team_diff1));
      }

      const entries = Object.entries(src);
      if (!entries.length) return comparisonRows;

      const mapped = entries
        .map(([label, value]) => {
          if (!label) return null;
          if (value && typeof value === "object") {
            return {
              label,
              team_diff1: Number(value.team_diff1),
              team_diff2: Number(value.team_diff2),
            };
          }
          return {
            label,
            team_diff1: Number(value),
          };
        })
        .filter(Boolean)
        .filter(
          (r) =>
            r.label &&
            (Number.isFinite(r.team_diff1) || Number.isFinite(r.team_diff2)),
        );

      mapped.sort((a, b) => {
        const aKey = Number.isFinite(a.team_diff1) ? a.team_diff1 : 0;
        const bKey = Number.isFinite(b.team_diff1) ? b.team_diff1 : 0;
        return bKey - aKey;
      });
      return mapped;
    })();

    const comparisonHasDiff1 = computedComparisonRows.some((r) =>
      Number.isFinite(Number(r?.team_diff1)),
    );
    const comparisonHasDiff2 = computedComparisonRows.some((r) =>
      Number.isFinite(Number(r?.team_diff2)),
    );

    out.push(
      <div className="sbc-hdr-chart-wrapper" key="ewm-hdr-chart">
        <FeedbackCommonHeader
          key="ewm-hdr"
          title={
            <>
              <div className="feedback-common-header__title-line1">
                Summary by Competency -
              </div>
              <div className="feedback-common-header__title-line2">
                Engagement With Management
              </div>
            </>
          }
          // right={
          //   localOverallScore !== undefined && localOverallScore !== null ? (
          //     <div className="sbc-header__pill">
          //       Overall Score – {formatOverallScore(localOverallScore)}/5
          //     </div>
          //   ) : null
          // }
          className="sbc-header"
        />
        <div key="ewm-chart" className="sbc-chart">
          <CompetencyThreeBarChart
            items={parsed}
            legendItems={LEGEND_2}
            className="sbc-chart__inner"
            barHeight={barHeight}
            barGap={6}
            rowPaddingY={24}
            firstRowBorder={true}
            onRowsChange={handleRowsChange}
          />
        </div>
      </div>,
    );

    if (
      showComparisonTable &&
      ((localComparisonAverage &&
        Object.keys(localComparisonAverage).length > 0) ||
        (managerComparisonAverage &&
          Object.keys(managerComparisonAverage).length > 0))
    ) {
      out.push(
        <div key="ewm-compare" className="sbc-compare">
          <FeedbackCommonHeader
            key="ewm-compare-hdr"
            title={`Comparison of Average Scores – ${file3Year} Vs ${file2Year}`}
            titleWidth={100}
            className="sbc-compare__header"
          />

          <div className="sbc-compare__notes">
            {localComparisonNotes.map((t, i) => (
              <div key={i} className="sbc-compare__note">
                <span className="sbc-compare__note-bullet" aria-hidden="true">
                  ▪
                </span>
                <span
                  className="sbc-compare__note-text"
                  onDoubleClick={() =>
                    (() => {
                      editingNoteDraftRef.current = String(t ?? "");
                      setEditingNoteIndex(i);
                    })()
                  }
                >
                  {editingNoteIndex === i ? (
                    <div className="sbc-compare__note-edit">
                      <textarea
                        defaultValue={editingNoteDraftRef.current}
                        autoFocus
                        onChange={(e) => {
                          editingNoteDraftRef.current = e.target.value;
                        }}
                        onBlur={() => handleNoteCommit(i, editingNoteDraftRef.current)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) e.currentTarget.blur();
                          if (e.key === "Escape") setEditingNoteIndex(null);
                        }}
                        rows={2}
                        className="sbc-compare__note-textarea"
                      />
                      <button
                        type="button"
                        className="sbc-compare__note-add"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleAddNoteAfter(i)}
                        aria-label="Add note"
                        title="Add note"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    t
                  )}
                </span>
              </div>
            ))}
          </div>

          <ComparisonTable
            computedComparisonRows={computedComparisonRows}
            comparisonHasDiff1={comparisonHasDiff1}
            comparisonHasDiff2={comparisonHasDiff2}
            currentYear={currentYear}
            file2Year={file2Year}
            file3Year={file3Year}
            onCellBlur={handleCellBlur}
            title="Comparison of Team Scores"
          />

          {computedManagerComparisonRows.length > 0 && (
            <div className="sbc-compare__manager-table-wrapper">
              <ComparisonTable
                computedComparisonRows={computedManagerComparisonRows}
                comparisonHasDiff1={managerHasDiff1}
                comparisonHasDiff2={managerHasDiff2}
                currentYear={currentYear}
                file2Year={file2Year}
                file3Year={file3Year}
                onCellBlur={(rowIndex, fieldKey, newValue, label) => {
                  const numValue = Number(newValue);
                  const updated = {
                    ...normalizeAverageMap(localManagerComparisonAverage),
                  };
                  const targetLabel = label;
                  if (targetLabel) {
                    if (typeof updated[targetLabel] === "object") {
                      const nextKey = fieldKey.replace("team_", "manager_");
                      const nextUnderscoreKey = nextKey
                        .replace(/manager_diff1$/, "manager_diff_1")
                        .replace(/manager_diff2$/, "manager_diff_2");
                      updated[targetLabel] = {
                        ...updated[targetLabel],
                        [nextKey]: numValue,
                        [nextUnderscoreKey]: numValue,
                      };
                    } else {
                      updated[targetLabel] = numValue;
                    }
                  }
                  setLocalManagerComparisonAverage(updated);
                  emitDataChange({ manager_comparision_average: updated });
                }}
                title="Comparison of Manager Scores"
              />
            </div>
          )}

          <div className="sbc-compare__legend">
            <div className="sbc-compare__legend-item sbc-compare__legend-item--pos">
              (+) Indicates increase in score this year when compared to last year
            </div>
            <div className="sbc-compare__legend-item sbc-compare__legend-item--neg">
              (-) Indicates decrease in score this year when compared to last year
            </div>
          </div>
        </div>
      );
    }

    return out;
  }, [
    rows,
    localOverallScore,
    title,
    comparisonTitle,
    localComparisonNotes,
    localComparisonAverage,
    localManagerComparisonAverage,
    showComparisonTable,
    handleCellBlur,
    handleNoteCommit,
    file2Year,
    file3Year,
    currentYear,
    barHeight,
    handleRowsChange,
    editingNoteIndex,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1050}
      pagePadding={0}
      contentClassName="summary-by-competency-page"
      componentId="engagement-with-management-summary-by-competency"
    />
  );
};

export default EngagementWithManagementSummaryByCompetencyPage;
