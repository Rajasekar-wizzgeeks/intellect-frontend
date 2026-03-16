import React, { useEffect, useMemo, useState } from "react";
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
  comparisonNotes = [
    "No significant differences in Team scores and Manager scores between 2024 and 2025",
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

  useEffect(() => {
    setLocalComparisonAverage(comparisonAverage);
  }, [comparisonAverage]);

  const handleCellBlur = (rowIndex, fieldKey, newValue) => {
    const numValue = Number(newValue);
    const updatedComparison = { ...localComparisonAverage };
    const labels = Object.keys(updatedComparison);
    const targetLabel = labels[rowIndex];

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
    }
  };

  const computeOverallFromRows = (rowsArg) => {
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
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setLocalOverallScore(computeOverallFromRows(newRows));
    setAverageCompentency((prev) => ({
      ...prev,
      engagement_with_management_competency: newRows,
    }));
  };

  const blocks = useMemo(() => {
    const out = [];

    const parsed = rows.map((it) => ({
      ...it,
      managerRating: Number(it.managerRating),
      selfRating: Number(it.selfRating),
    }));

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

    const formatDiff = (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return "";
      const isPos = n > 0;
      return `${isPos ? "+" : ""}${n
        .toFixed(2)
        .replace(/0$/, "")
        .replace(/\.0$/, "")}`;
    };

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
          right={
            localOverallScore !== undefined && localOverallScore !== null ? (
              <div className="sbc-header__pill">
                Overall Score – {formatOverallScore(localOverallScore)}/5
              </div>
            ) : null
          }
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

    if (localComparisonAverage && Object.keys(localComparisonAverage).length > 0) {
    out.push(
      <>
      {localComparisonAverage && Object.keys(localComparisonAverage).length > 0 && <div key="ewm-compare" className="sbc-compare">
        <FeedbackCommonHeader
          key="ewm-compare-hdr"
          title={`Comparison of Average Scores – ${file3Year} Vs ${file2Year}`}
          titleWidth={100}
          className="sbc-compare__header"
        />

        <div className="sbc-compare__notes">
          {comparisonNotes.map((t, i) => (
            <div key={i} className="sbc-compare__note">
              <span className="sbc-compare__note-bullet" aria-hidden="true">
                ▪
              </span>
              <span className="sbc-compare__note-text">{t}</span>
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
        />

        <div className="sbc-compare__legend">
          <div className="sbc-compare__legend-item sbc-compare__legend-item--pos">
            (+) Indicates increase in score this year when compared to last year
          </div>
          <div className="sbc-compare__legend-item sbc-compare__legend-item--neg">
            (-) Indicates decrease in score this year when compared to last year
          </div>
        </div>
      </div>}
      </>
    );}

    return out;
  }, [
    rows,
    localOverallScore,
    title,
    comparisonTitle,
    comparisonNotes,
    localComparisonAverage,
  ]);

  useEffect(() => {
    setLocalOverallScore(overallScore);
    setRows(items);
  }, [overallScore]);

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
