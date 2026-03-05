import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyThreeBarChart from "./CompetencyThreeBarChart";
import "../styles/summaryByCompetencyPage.scss";

const SummaryByCompetencyPage = ({
  title = "Summary by Competency – Creating the Right Culture",
  overallScore = 4.53,
  items = [],
  leadershipOverallScore = 4.53,
  leadershipItems = [],
  setAverageCompentency,
  setFeedbackOverallData,
}) => {
  const [
    rightCultureCompetencyOverallScore,
    setRightCultureCompetencyOverallScore,
  ] = useState(overallScore);
  const [
    leadershipCompetencyOverallScore,
    setLeadershipCompetencyOverallScore,
  ] = useState(leadershipOverallScore);
  const [rightCultureRows, setRightCultureRows] = useState(items);
  const [leadershipRows, setLeadershipRows] = useState(leadershipItems);

  const handleOverallScore = (rows) => {
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

  const handleItemsChange = (rows, competency) => {
    const overallScore = handleOverallScore(rows);

    if (competency === "right_culture_competency") {
      setRightCultureCompetencyOverallScore(overallScore);
      setRightCultureRows(rows);
      setAverageCompentency((prev) => ({
        ...prev,
        right_culture_competency: rows,
      }));
    }
    if (competency === "leadership_style_competency") {
      setLeadershipCompetencyOverallScore(overallScore);
      setLeadershipRows(rows);
      setAverageCompentency((prev) => ({
        ...prev,
        leadership_style_competency: rows,
      }));
    }
  };

  const blocks = useMemo(() => {
    const out = [];

    const parsed = rightCultureRows.map((it) => ({
      ...it,
      groupMean: Number(it.groupMean),
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

    const chartItems = parsed.map((it, idx) => {
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

    out.push(
      <div className="sbc-hdr-chart-wrapper" key="sbc-wrapper-1">
        <FeedbackCommonHeader
          key="sbc-hdr-1"
          title={
            <>
              <div className="feedback-common-header__title-line1">
                Summary by Competency -
              </div>
              <div className="feedback-common-header__title-line2">
                Creating the Right Culture
              </div>
            </>
          }
          right={
            overallScore !== undefined && overallScore !== null ? (
              <div className="sbc-header__pill">
                Overall Score – {rightCultureCompetencyOverallScore}/5
              </div>
            ) : null
          }
          className="sbc-header"
        />
        <div key="sbc-chart-1" className="sbc-chart">
          <CompetencyThreeBarChart
            items={chartItems}
            className="sbc-chart__inner"
            barHeight={12}
            barGap={6}
            firstRowBorder={true}
            onRowsChange={(row) =>
              handleItemsChange(row, "right_culture_competency")
            }
          />
        </div>
      </div>,
    );

    // out.push(
    //   <div key="sbc-chart-1" className="sbc-chart">
    //     <CompetencyThreeBarChart
    //       items={chartItems}
    //       className="sbc-chart__inner"
    //       barHeight={12}
    //       barGap={6}
    //       firstRowBorder={true}
    //       onRowsChange={(row) =>
    //         handleItemsChange(row, "right_culture_competency")
    //       }
    //     />
    //   </div>,
    // );

    out.push(
      <div>
        <FeedbackCommonHeader
          key="sbc-hdr-2"
          title={
            <>
              <div className="feedback-common-header__title-line1">
                Summary by Competency -
              </div>
              <div className="feedback-common-header__title-line2">
                Leadership Personality & Style
              </div>
            </>
          }
          right={
            leadershipOverallScore !== undefined &&
            leadershipOverallScore !== null ? (
              <div className="sbc-header__pill">
                Overall Score – {leadershipCompetencyOverallScore}/5
              </div>
            ) : null
          }
          className="sbc-header-leadership"
        />
        <div key="sbc-chart-2" className="sbc-chart">
          <CompetencyThreeBarChart
            items={leadershipRows}
            className="sbc-chart__inner"
            barHeight={9}
            barGap={4}
            firstRowBorder={true}
            onRowsChange={(row) =>
              handleItemsChange(row, "leadership_style_competency")
            }
          />
        </div>
      </div>,
    );

    // out.push(
    //   <div key="sbc-chart-2" className="sbc-chart">
    //     <CompetencyThreeBarChart
    //       items={leadershipRows}
    //       className="sbc-chart__inner"
    //       barHeight={9}
    //       barGap={4}
    //       firstRowBorder={true}
    //       onRowsChange={(row) =>
    //         handleItemsChange(row, "leadership_style_competency")
    //       }
    //     />
    //   </div>,
    // );

    return out;
  }, [
    rightCultureRows,
    leadershipRows,
    title,
    rightCultureCompetencyOverallScore,
    leadershipCompetencyOverallScore,
  ]);

  useEffect(() => {
    setRightCultureCompetencyOverallScore(overallScore);
    setRightCultureRows(items);
  }, [overallScore]);

  useEffect(() => {
    setLeadershipCompetencyOverallScore(leadershipOverallScore);
    setLeadershipRows(leadershipItems);
  }, [leadershipOverallScore]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="summary-by-competency-page"
      componentId="summary-by-competency"
    />
    // </div>
  );
};

export default SummaryByCompetencyPage;
