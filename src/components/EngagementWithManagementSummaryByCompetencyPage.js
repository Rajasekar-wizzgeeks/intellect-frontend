import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyThreeBarChart from "./CompetencyThreeBarChart";
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
}) => {
  const [localOverallScore, setLocalOverallScore] = useState(overallScore);
  const [rows, setRows] = useState(items);

  const computeOverallFromRows = (rowsArg) => {
    if (!Array.isArray(rowsArg) || !rowsArg.length) return 0;

    let total = 0;
    let count = 0;

    rowsArg.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key === "label" || key === "callout") return;
        const num = Number(value);
        if (Number.isFinite(num) && value) {
          total += num;
          count += 1;
        }
      });
    });

    if (!count) return 0;
    return Number((total / count).toFixed(2));
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

    // out.push(
    //   <div key="ewm-chart" className="sbc-chart">
    //     <CompetencyThreeBarChart
    //       items={parsed}
    //       legendItems={LEGEND_2}
    //       className="sbc-chart__inner"
    //       barHeight={barHeight}
    //       barGap={6}
    //       rowPaddingY={24}
    //       firstRowBorder={true}
    //       onRowsChange={handleRowsChange}
    //     />
    //   </div>,
    // );

    out.push(
      <div key="ewm-compare" className="sbc-compare">
        <FeedbackCommonHeader
          key="ewm-compare-hdr"
          title={comparisonTitle}
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

        <div
          className="sbc-compare__table"
          role="table"
          aria-label="Comparison table"
        >
          <div className="sbc-compare__thead" role="rowgroup">
            <div className="sbc-compare__tr" role="row">
              <div className="sbc-compare__th" role="columnheader">
                Comparison of Team Scores
              </div>
              <div
                className="sbc-compare__th sbc-compare__th--right"
                role="columnheader"
              >
                Difference - 2025 Vs 2024
              </div>
            </div>
          </div>

          <div className="sbc-compare__tbody" role="rowgroup">
            {comparisonRows.map((r, i) => {
              const n = Number(r?.diff);
              const isPos = Number.isFinite(n) && n > 0;
              const isNeg = Number.isFinite(n) && n < 0;
              const diffText = Number.isFinite(n)
                ? `${isPos ? "+" : ""}${n.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}`
                : "";

              return (
                <div key={i} className="sbc-compare__tr" role="row">
                  <div className="sbc-compare__td" role="cell">
                    {r.label}
                  </div>
                  <div
                    className={`sbc-compare__td sbc-compare__td--right ${
                      isPos
                        ? "sbc-compare__td--pos"
                        : isNeg
                          ? "sbc-compare__td--neg"
                          : ""
                    }`.trim()}
                    role="cell"
                  >
                    {diffText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sbc-compare__legend">
          <div className="sbc-compare__legend-item sbc-compare__legend-item--pos">
            (+) Indicates increase in score this year when compared to last year
          </div>
          <div className="sbc-compare__legend-item sbc-compare__legend-item--neg">
            (-) Indicates decrease in score this year when compared to last year
          </div>
        </div>
      </div>,
    );

    return out;
  }, [
    rows,
    localOverallScore,
    title,
    comparisonTitle,
    comparisonNotes,
    comparisonRows,
  ]);

  useEffect(() => {
    setLocalOverallScore(overallScore);
    setRows(items);
  }, [overallScore]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="summary-by-competency-page"
      componentId="engagement-with-management-summary-by-competency"
    />
  );
};

export default EngagementWithManagementSummaryByCompetencyPage;
