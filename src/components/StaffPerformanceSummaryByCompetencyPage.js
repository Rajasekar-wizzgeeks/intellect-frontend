import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyThreeBarChart from "./CompetencyThreeBarChart";
import "../styles/summaryByCompetencyPage.scss";

const LEGEND_2 = [
  {
    key: "groupMean",
    label: "Group Mean (Teachers & Office Staff)",
    color: "var(--chart-series-group-mean)",
  },
  {
    key: "selfRating",
    label: "Self Rating",
    color: "var(--chart-series-self-rating)",
  },
];

const formatOverallScore2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return v;
  return n
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
};

const StaffPerformanceSummaryByCompetencyPage = ({
  title = "Summary by Competency – Leadership for Staff Performance & Development",
  overallScore = 4.64,
  items = [],
  title2,
  overallScore2,
  items2 = [],
  barHeight = 12,
  setAverageCompentency,
}) => {
  const [leftOverallScore, setLeftOverallScore] = useState(overallScore);
  const [rightOverallScore, setRightOverallScore] = useState(overallScore2);
  const [leftRows, setLeftRows] = useState(items);
  const [rightRows, setRightRows] = useState(items2);

  const computeOverallFromRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return 0;
    let total = 0;
    let count = 0;

    rows.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key === "label" || key === "selfRating") return;
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

  const handleRowsChange = (rows, section) => {
    if (section === "left") {
      setLeftRows(rows);
      setLeftOverallScore(computeOverallFromRows(rows));
      setAverageCompentency((prev) => ({
        ...prev,
        leadership_staff_dev_competency: rows,
      }));
    } else if (section === "right") {
      setRightRows(rows);
      setRightOverallScore(computeOverallFromRows(rows));
      setAverageCompentency((prev) => ({
        ...prev,
        educational_quality_competency: rows,
      }));
    }
  };

  const blocks = useMemo(() => {
    const out = [];

    const buildChartItems = (rawItems) => {
      const parsed = rawItems.map((it) => ({
        ...it,
        groupMean: Number(it.groupMean),
        selfRating: Number(it.selfRating),
      }));

      let maxIdx = -1;
      let minIdx = -1;

      parsed.forEach((it, idx) => {
        const v = Number.isFinite(it.groupMean) ? it.groupMean : -Infinity;
        if (
          maxIdx === -1 ||
          v >
            (Number.isFinite(parsed[maxIdx]?.groupMean)
              ? parsed[maxIdx].groupMean
              : -Infinity)
        ) {
          maxIdx = idx;
        }
        if (
          minIdx === -1 ||
          v <
            (Number.isFinite(parsed[minIdx]?.groupMean)
              ? parsed[minIdx].groupMean
              : Infinity)
        ) {
          minIdx = idx;
        }
      });

      return parsed.map((it, idx) => {
        if (idx === maxIdx) {
          return {
            ...it,
            // callout: {
            //   variant: "highest",
            //   text: "Highest average score\ngiven by the group",
            // },
          };
        }
        if (idx === minIdx) {
          return {
            ...it,
            // callout: {
            //   variant: "lowest",
            //   text: "Lowest average score\ngiven by the group",
            // },
          };
        }
        return it;
      });
    };

    const pushSection = ({
      keyPrefix,
      sectionTitle,
      sectionOverallScore,
      sectionItems,
      border = false,
    }) => {
      const isLeft = keyPrefix === "spsbc-1";
      const rows = isLeft ? leftRows : rightRows;
      const currentOverall = isLeft ? leftOverallScore : rightOverallScore;

      const chartItems = buildChartItems(rows);

      out.push(
        <div
          className={`${border ? "sbc-hdr-chart-wrapper" : "sbc-hdr-chart-educational-quality"} `}
          key={keyPrefix}
        >
          <FeedbackCommonHeader
            key={`${keyPrefix}-hdr`}
            title={sectionTitle}
            right={
              currentOverall !== null && currentOverall !== undefined ? (
                <div className="sbc-header__pill">
                  Overall Score – {formatOverallScore2(currentOverall)}/5
                </div>
              ) : null
            }
            className={`sbc-header  `}
          />

          <div key={`${keyPrefix}-chart`} className="sbc-chart">
            <CompetencyThreeBarChart
              items={chartItems}
              legendItems={LEGEND_2}
              className="sbc-chart__inner"
              barHeight={12}
              barGap={6}
              firstRowBorder={true}
              onRowsChange={(rows) =>
                handleRowsChange(rows, isLeft ? "left" : "right")
              }
            />
          </div>
        </div>,
      );

      // out.push(
      //   <div key={`${keyPrefix}-chart`} className="sbc-chart">
      //     <CompetencyThreeBarChart
      //       items={chartItems}
      //       legendItems={LEGEND_2}
      //       className="sbc-chart__inner"
      //       barHeight={12}
      //       barGap={6}
      //       firstRowBorder={true}
      //       onRowsChange={(rows) =>
      //         handleRowsChange(rows, isLeft ? "left" : "right")
      //       }
      //     />
      //   </div>,
      // );
    };

    pushSection({
      keyPrefix: "spsbc-1",
      sectionTitle: title,
      sectionOverallScore: overallScore,
      sectionItems: items,
      border: true,
    });

    if (title2 || (items2 && items2.length)) {
      pushSection({
        keyPrefix: "spsbc-2",
        sectionTitle: title2 || "Summary by Competency",
        sectionOverallScore: overallScore2,
        sectionItems: items2 || [],
      });
    }

    return out;
  }, [leftRows, rightRows, leftOverallScore, rightOverallScore]);

  useEffect(() => {
    setLeftOverallScore(overallScore);
    setLeftRows(items);
  }, [overallScore]);

  useEffect(() => {
    setRightOverallScore(overallScore2);
    setRightRows(items2);
  }, [overallScore2]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="summary-by-competency-page"
      componentId="staff-performance-summary-by-competency"
    />
  );
};

export default StaffPerformanceSummaryByCompetencyPage;
