import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyThreeBarChart from "./CompetencyThreeBarChart";
import "../styles/suggestedGuidelines.scss";
import "../styles/competencyBiggerPicture.scss";

const SuggestedGuidelines = ({
  title = "Your Competency Summary: The Bigger Picture",
  overallScore,
  note = "Snapshot of average / mean score for each Competency based on inputs from respondent's vis-a vis your self-rating",
  items = [],
  averageCompentency,
}) => {
  const [averageCompentencyData, setAverageCompentencyData] = useState(items);
  const [averageCompentencyOverallScore, setAverageCompentencyOverallScore] =
    useState(overallScore);
  const handleOverallAvg = (data) => {
    if (!data || typeof data !== "object") return [];

    const competencyKeyMap = {
      right_culture_competency: "Creating the Right Culture",
      leadership_style_competency: "Leadership Personality & Style",
      leadership_staff_dev_competency:
        "Leadership for Staff Performance & Development",
      educational_quality_competency: "Educational Quality & Student Outcomes",
      engagement_with_management_competency: "Engagement with Management",
    };

    const formatAvg = (n) => {
      const num = Number(n);
      if (!Number.isFinite(num)) return undefined;
      return Number(num.toFixed(2));
    };

    const resultItems = [];

    Object.entries(data).forEach(([compKey, rows]) => {
      const label = competencyKeyMap[compKey] || compKey;
      if (!Array.isArray(rows) || !rows.length) return;

      let sumGroup = 0;
      let countGroup = 0;
      let sumManager = 0;
      let countManager = 0;
      let sumSelf = 0;
      let countSelf = 0;

      rows.forEach((row) => {
        const g = Number(row?.groupMean);
        if (Number.isFinite(g)) {
          sumGroup += g;
          countGroup += 1;
        }

        const m = Number(row?.managerRating);
        if (Number.isFinite(m)) {
          sumManager += m;
          countManager += 1;
        }

        const s = Number(row?.selfRating);
        if (Number.isFinite(s)) {
          sumSelf += s;
          countSelf += 1;
        }
      });

      const avgGroup = countGroup ? formatAvg(sumGroup / countGroup) : null;
      const avgManager = countManager
        ? formatAvg(sumManager / countManager)
        : null;
      const avgSelf = countSelf ? formatAvg(sumSelf / countSelf) : null;

      if (avgGroup !== null || avgManager !== null || avgSelf !== null) {
        resultItems.push({
          label,
          groupMean: avgGroup,
          managerRating: avgManager,
          selfRating: avgSelf,
        });
      }
    });

    return resultItems;
  };

  useEffect(() => {
    // if (!averageCompentency) return;
    const summary = handleOverallAvg(averageCompentency);
    if (!summary.length) {
      setAverageCompentencyData(items);
      setAverageCompentencyOverallScore(overallScore);
      return;
    }
    const merged = items.map((baseRow) => {
      const updated = summary.find((row) => row.label === baseRow.label);
      return updated ? { ...baseRow, ...updated } : baseRow;
    });
    // console.log("merged", merged);
    setAverageCompentencyData(merged);

    let total = 0;
    let count = 0;

    merged.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key === "label" || key === "selfRating") return;
        const num = Number(value);
        if (Number.isFinite(num) && value) {
          total += num;
          count += 1;
        }
      });
    });

    if (!count) {
      setAverageCompentencyOverallScore(overallScore);
    } else {
      setAverageCompentencyOverallScore(Number((total / count).toFixed(2)));
    }
  }, [averageCompentency, items, overallScore]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div key="sg" className="suggested-guidelines-block">
        <FeedbackCommonHeader
          key="sg-h1"
          title="Suggested Guidelines When Viewing Your Report"
        />

        <div key="sg-content" className="suggested-guidelines-content">
          <ul className="suggested-guidelines-list">
            <li>
              View the report with an open mind and without filters or
              preconceived notions driven by self-perception or past feedback
            </li>
            <li>
              Each Respondent views you in a particular light and this
              perception is reality for them. So, do not be surprised if you
              hear things you don’t like or disagree with
            </li>
            <li>
              Each Respondent has invested their time to offer their honest
              thoughts and perceptions. Please try not to discount any of the
              feedback
            </li>
            <li>
              The feedback is focused on specific behaviors at the workplace and
              is not a reflection of you as a “whole”
            </li>
            <li>
              See this as an opportunity to learn about yourself and a platform
              for professional development
            </li>
            <li>
              Provide equal focus on the areas of improvement as well as
              positives/ areas of strength. You are the best person to decide
              the areas you want to develop
            </li>
            <li>
              Give yourself time to reflect on the information before taking
              action
            </li>
            <li>
              To gain more clarity on the report or get more ideas to grow, feel
              free to speak to a mentor or even a professional you may consider
              a role model in specific leadership competencies
            </li>
          </ul>
        </div>
      </div>,
    );

    out.push(
      <FeedbackCommonHeader
        className="suggestion-overall"
        key="hdr"
        title={title}
        right={
          averageCompentencyOverallScore !== undefined &&
          averageCompentencyOverallScore !== null ? (
            <div className="cbp-header__pill">
              Overall Score – {averageCompentencyOverallScore}/5
            </div>
          ) : null
        }
      />,
    );

    out.push(
      <div key="note" className="cbp-note">
        <div className="cbp-note__bullet" aria-hidden="true" />
        <div className="cbp-note__text">{note}</div>
      </div>,
    );

    out.push(
      <div key="chart" className="cbp-chart">
        <CompetencyThreeBarChart
          items={averageCompentencyData}
          barHeight={8}
          barGap={7}
          hideInputField={true}
        />
      </div>,
    );

    return out;
  }, [averageCompentencyData, note, overallScore, title]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="suggested-guidelines-page"
      componentId="suggested-guidelines"
    />
    // </div>
  );
};

export default SuggestedGuidelines;
