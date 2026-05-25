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
  onDataChange,
  totalResponse = {
    total: 1,
    Self: 0,
    Manager: 0,
    Subordinates: 0,
  },
}) => {
  const [leftOverallScore, setLeftOverallScore] = useState(overallScore);
  const [rightOverallScore, setRightOverallScore] = useState(overallScore2);
  const [leftRows, setLeftRows] = useState(items);
  const [rightRows, setRightRows] = useState(items2);

  const sortRowsByGroupMeanDesc = (rows) => {
    if (!Array.isArray(rows)) return rows;
    const cloned = [...rows];
    cloned.sort((a, b) => {
      const av = Number(a?.groupMean);
      const bv = Number(b?.groupMean);

      const aMissing = !Number.isFinite(av) || av === -1;
      const bMissing = !Number.isFinite(bv) || bv === -1;

      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;

      return bv - av;
    });
    return cloned;
  };

  const computeOverallFromRows = (rows) => {
    if (!Array.isArray(rows) || !rows.length) return 0;

    const subCount = Number(totalResponse?.Subordinates) || 0;
    const mgrCount = Number(totalResponse?.Manager) || 0;

    let totalSubScore = 0;
    let totalMgrScore = 0;
    let subQuestionsCount = 0;
    let mgrQuestionsCount = 0;

    rows.forEach((row) => {
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

  const handleRowsChange = (rows, section) => {
    const sortedRows = sortRowsByGroupMeanDesc(rows);
    if (section === "left") {
      setLeftRows(sortedRows);
      setLeftOverallScore(computeOverallFromRows(sortedRows));
      setAverageCompentency((prev) => ({
        ...prev,
        leadership_staff_dev_competency: sortedRows,
      }));
      if (onDataChange) {
        onDataChange({ leadership_staff_dev_competency: sortedRows });
      }
    } else if (section === "right") {
      setRightRows(sortedRows);
      setRightOverallScore(computeOverallFromRows(sortedRows));
      setAverageCompentency((prev) => ({
        ...prev,
        educational_quality_competency: sortedRows,
      }));
      if (onDataChange) {
        onDataChange({ educational_quality_competency: sortedRows });
      }
    }
  };

  const blocks = useMemo(() => {
    const out = [];

    const buildHeaderTitleNode = (rawTitle) => {
      if (typeof rawTitle !== "string") return rawTitle;
      const raw = rawTitle.trim();
      if (!raw) return raw;

      const colonIdx = raw.indexOf(":");
      if (colonIdx !== -1 && colonIdx < raw.length - 1) {
        const line1 = raw.slice(0, colonIdx + 1).trim();
        const line2 = raw.slice(colonIdx + 1).trim();
        return (
          <>
            <div className="feedback-common-header__title-line1">{line1}</div>
            <div className="feedback-common-header__title-line2">{line2}</div>
          </>
        );
      }

      const dashMatch = raw.match(/^(.*?)(\s[-–—]\s)(.+)$/);
      if (dashMatch) {
        const line1 = String(dashMatch[1] ?? "").trim();
        const line2 = String(dashMatch[3] ?? "").trim();
        return (
          <>
            <div className="feedback-common-header__title-line1">{line1} -</div>
            <div className="feedback-common-header__title-line2">{line2}</div>
          </>
        );
      }

      return raw;
    };

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
            title={buildHeaderTitleNode(sectionTitle)}
            // right={
            //   currentOverall !== null && currentOverall !== undefined ? (
            //     <div className="sbc-header__pill">
            //       Overall Score – {formatOverallScore2(currentOverall)}/5
            //     </div>
            //   ) : null
            // }
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
      pageHeight={1153}
      pagePadding={0}
      contentClassName="summary-by-competency-page"
      componentId="staff-performance-summary-by-competency"
    />
  );
};

export default StaffPerformanceSummaryByCompetencyPage;
