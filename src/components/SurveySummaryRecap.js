import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import DavCommonHeader from "./DavCommonHeader";
import "../styles/SurveySummaryRecap.scss";
import LeadhipforStaff from "../assets/png/leadershipForStaffPerformance.png"
import LeadhipPersonality from "../assets/png/leadershipPersonalityAndStyle.png"
import educationalQualityAndStudentOutcomes from "../assets/png/educationalQualityAndStudentOutcomes.png"
import creatingTheRightCulture from "../assets/png/creatingTheRightCulture.png"
import engagementAndManagement from "../assets/png/engagementAndManagement.png"
import noofPrinciplesAssesed from "../assets/png/NoofPrinciplesAssesed.png"
import responsesGivenBy from "../assets/png/responsesGivenBy.png"
import totalNoOfQuestions from "../assets/png/totalNoOfQuestions.png"

const defaultCompetencies = [
  { title: "Leadership for\nStaff performance\n& Development", icon: LeadhipforStaff },
  { title: "Leadership\nPersonality &\nStyle", icon: LeadhipPersonality },
  { title: "Educational\nQuality & Student\noutcomes", icon: educationalQualityAndStudentOutcomes },
  { title: "Creating the right\nculture", icon: creatingTheRightCulture },
  { title: "Engagement with\nManagement", icon: engagementAndManagement },
];

const getCompetencyData = (compName) => {
  const t = compName.toLowerCase();
  if (t.includes("staff") || t.includes("performance") || t.includes("development")) {
    return { title: "Leadership for\nStaff performance\n& Development", icon: LeadhipforStaff };
  }
  if (t.includes("style") || t.includes("personality")) {
    return { title: "Leadership\nPersonality &\nStyle", icon: LeadhipPersonality };
  }
  if (t.includes("educational") || t.includes("quality") || t.includes("outcomes") || t.includes("student")) {
    return { title: "Educational\nQuality & Student\noutcomes", icon: educationalQualityAndStudentOutcomes };
  }
  if (t.includes("culture") || t.includes("right")) {
    return { title: "Creating the right\nculture", icon: creatingTheRightCulture };
  }
  if (t.includes("engagement") || t.includes("management")) {
    return { title: "Engagement with\nManagement", icon: engagementAndManagement };
  }
  return { title: compName, icon: LeadhipforStaff };
};

const SurveySummaryRecap = ({ recap }) => {
  const recapData = recap?.summary_framework_recap || recap;

  const principalCount = recapData?.principal_count;
  const responsesList = recapData?.responses_given_by;
  const surveyQuestionCount = recapData?.survey_question_count;
  const qualitativeQuestionCount = recapData?.qualitative_question_count;
  const totalQuestions = recapData?.total_questions;
  const competencyCount = recapData?.competency_count;
  const apiCompetencies = recapData?.competencies;

  const formattedResponses = Array.isArray(responsesList) && responsesList.length > 0
    ? responsesList.join(", ")
    : "Self, Managers & Staff members (Teachers / Office staff)";

  const formattedQuestionsText = totalQuestions !== undefined
    ? `${totalQuestions} (${surveyQuestionCount || 0} survey questions + ${qualitativeQuestionCount || 0} qualitative questions)`
    : "29 (24 survey questions + 5 qualitative questions)";

  const formattedBullet1Text = `The ${surveyQuestionCount || 24} survey questions were clustered into the following ${competencyCount || 5} competencies`;

  const displayCompetencies = useMemo(() => {
    if (Array.isArray(apiCompetencies) && apiCompetencies.length > 0) {
      return apiCompetencies.map(getCompetencyData);
    }
    return defaultCompetencies;
  }, [apiCompetencies]);

  const blocks = useMemo(() => {
    return [
      <div key="recap-header">
        <DavCommonHeader title="Survey Framework - Recap" />
      </div>,
      <div key="row1" className="sfr__row">
        <img className="sfr__row-icon" aria-hidden src={noofPrinciplesAssesed}/>
        <span className="sfr__row-label">No of Principals Assessed</span>
        <span className="sfr__row-colon">:</span>
        <span className="sfr__row-value">{principalCount !== undefined ? principalCount : ""}</span>
      </div>,
      <div key="div1" className="sfr__divider" />,

      <div key="row2" className="sfr__row">
        <img className="sfr__row-icon" aria-hidden src={responsesGivenBy}/>
        <span className="sfr__row-label">Responses given by</span>
        <span className="sfr__row-colon">:</span>
        <span className="sfr__row-value sfr__row-value--red">
          {formattedResponses}
        </span>
      </div>,
      <div key="div2" className="sfr__divider" />,

      <div key="row3" className="sfr__row">
        <img className="sfr__row-icon" aria-hidden src={totalNoOfQuestions}/>
        <span className="sfr__row-label">Total number of questions</span>
        <span className="sfr__row-colon">:</span>
        <span className="sfr__row-value sfr__row-value--red">
          {formattedQuestionsText}
        </span>
      </div>,
      <div key="div3" className="sfr__divider" />,

      <div key="bullet1" className="sfr__bullet">
        <span className="sfr__triangle" />
        <span>{formattedBullet1Text}</span>
      </div>,

      <div key="competencies" className="sfr__competencies">
        {displayCompetencies.map((c, i) => (
          <div key={i} className="sfr__comp">
            <div className="sfr__comp-circle">
              <img className="sfr__comp-icon" src={c.icon}/>
            </div>
            <div className="sfr__comp-title">
              {c.title.split("\n").map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        ))}
      </div>,

      <div key="bullet2" className="sfr__bullet sfr__bullet--last">
        <span className="sfr__triangle" />
        <span>
          The {qualitativeQuestionCount || 5} Qualitative comments questions were on{" "}
          <span className="sfr__red">
            “Leadership Style”, “Workplace culture”, “Leadership trait” and one thing the
            nominee should “continue doing” &amp; “stop doing”
          </span>
        </span>
      </div>,
    ];
  }, [
    principalCount,
    formattedResponses,
    formattedQuestionsText,
    formattedBullet1Text,
    displayCompetencies,
    qualitativeQuestionCount,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="sfr"
      pageClassName="dav360-page"
      componentId="survey-summary-recap"
    />
  );
};

export default SurveySummaryRecap;
