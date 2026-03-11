import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/surveyFeedback.scss";
import staffPerformanceDevlopment from "../assets/png/staffPerformanceDevlopment.png";
import personality from "../assets/png/personality.png";
import educationalQulaity from "../assets/png/educationalQulaity.png";
import culture from "../assets/png/culture.png";
import management from "../assets/png/management.png";

const SurveyFeedback = ({ overviewData }) => {
  const totalSurveyQuestion = useMemo(() => {
    if (!overviewData || typeof overviewData !== "object") return 0;

    return (
      Object.keys(overviewData?.educational_quality_competency || {}).length +
      Object.keys(overviewData?.engagement_with_management_competency || {})
        .length +
      Object.keys(overviewData?.leadership_staff_dev_competency || {}).length +
      Object.keys(overviewData?.right_culture_competency || {}).length +
      Object.keys(overviewData?.leadership_style_competency || {}).length
    );
  }, [overviewData]);

  const qualitativeQuestionCount = 6;

  const leadershipStaffDevQuestionCount = useMemo(() => {
    return Object.keys(overviewData?.leadership_staff_dev_competency || {})
      .length;
  }, [overviewData]);

  const educationalQualityQuestionCount = useMemo(() => {
    return Object.keys(overviewData?.educational_quality_competency || {})
      .length;
  }, [overviewData]);

  const engagementWithManagementQuestionCount = useMemo(() => {
    return Object.keys(
      overviewData?.engagement_with_management_competency || {},
    ).length;
  }, [overviewData]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div className="survey-feedback-content-block">
        <FeedbackCommonHeader
          key="h1"
          title={
            <>
              <div className="feedback-common-header__title-line1">
                360° Survey Feedback -
              </div>
              <div className="feedback-common-header__title-line2">
                Key Highlights
              </div>
            </>
          }
        />
        <div key="p1" className="survey-feedback-content">
          <ul className="survey-feedback-bullets">
            <li>
              A powerful multi-dimensional leadership development tool that
              provides constructive feedback and actionable insights
            </li>
            <li>
              Provides a clear picture of how people within your own circle of
              influence experience you
            </li>
            <li>Provides clear insights on what you should</li>
          </ul>

          <div className="survey-feedback-icon-row" aria-label="Legend">
            <div className="survey-feedback-icon-item">
              <span className="survey-feedback-icon survey-feedback-icon--start">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>Start doing</span>
            </div>

            <div className="survey-feedback-icon-item">
              <span className="survey-feedback-icon survey-feedback-icon--continue">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M6 6h4v12H6zM14 6h4v12h-4z" />
                </svg>
              </span>
              <span>Continue doing</span>
            </div>

            <div className="survey-feedback-icon-item">
              <span className="survey-feedback-icon survey-feedback-icon--stop">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 10c0 .79-.15 1.55-.42 2.25L9.75 7.42C10.45 7.15 11.21 7 12 7c2.76 0 5 2.24 5 5zM7 12c0-.79.15-1.55.42-2.25l6.83 6.83C13.55 16.85 12.79 17 12 17c-2.76 0-5-2.24-5-5z"
                  />
                </svg>
              </span>
              <span>Stop doing</span>
            </div>
          </div>

          <ul className="survey-feedback-bullets">
            <li>
              Feedback provided by each Respondent is a combination of scores
              and comments -
            </li>
          </ul>
          <ul className="survey-feedback-subpoints">
            <li>
              Ratings on a scale of 1 to 5 (1- Strongly Disagree, 2-Disagree, 3-
              No View, 4-Agree, 5-Strongly Agree)
            </li>
            <li>Qualitative Comments</li>
          </ul>

          <ul className="survey-feedback-bullets survey-ul-margin-item">
            <li>
              Feedback has been solicited and received from your Team Members
              ({overviewData?.total_response?.Subordinates || 0}) and Manager/s
            </li>
          </ul>
        </div>
      </div>,
    );

    out.push(
      <div className="survey-structure-page">
        <FeedbackCommonHeader key="h2" title="Survey Structure Overview" />
        <div key="p2" className="survey-feedback-content survey-structure">
          <ul className="survey-feedback-bullets survey-ul-item">
            <li className="survey-ul-item-li">
              Total number of <strong>Respondents</strong> –{" "}
              <strong>{overviewData?.total_response?.total - 1 || 0}</strong> +
              <strong> Self feedback</strong>
            </li>
            <li>
              Total number of questions –{" "}
              <strong>{totalSurveyQuestion + qualitativeQuestionCount}</strong>{" "}
              ({totalSurveyQuestion} survey questions +{" "}
              {qualitativeQuestionCount} qualitative questions)
            </li>
          </ul>

          <ul className="survey-feedback-subpoints survey-structure__sub">
            <li>
              The <strong>{totalSurveyQuestion} survey questions</strong> were
              clustered into
              <strong> 5 competencies</strong> as indicated below
            </li>
          </ul>

          <div className="survey-structure__competencies">
            {[
              {
                img: staffPerformanceDevlopment,
                title: "Leadership for Staff",
                subtitle: "Performance & Development",
              },
              {
                img: personality,
                title: "Leadership",
                subtitle: "Personality & Style",
              },
              {
                img: educationalQulaity,
                title: "Educational Quality &",
                subtitle: "Student Outcomes",
              },
              {
                img: culture,
                title: "Creating the",
                subtitle: "Right Culture",
              },
              {
                img: management,
                title: "Engagement with",
                subtitle: "Management",
              },
            ].map((c) => (
              <div key={c.subtitle} className="survey-structure__comp">
                <img
                  className="survey-structure__icon"
                  src={c.img}
                  alt={c.subtitle}
                />
                <div className="survey-structure__label">
                  <div>{c.title}</div>
                  <div>{c.subtitle}</div>
                </div>
              </div>
            ))}
          </div>

          <ul className="survey-feedback-bullets survey-structure__note survey-ul-margin-item">
            <li>
              <em>Note : Of the 24 survey questions on the 5 competencies,</em>
            </li>
          </ul>

          <ul className="survey-structure__notes">
            <li>
              <span className="survey-structure__dash" />
              <span>
                <strong>{leadershipStaffDevQuestionCount} questions</strong> on
                <strong>
                  {" "}
                  Leadership for Staff Performance &amp; Development
                </strong>
                , were not included for <strong>Managers</strong> as they were
                relevant only for team members
              </span>
            </li>
            <li>
              <span className="survey-structure__dash" />
              <span>
                <strong>{educationalQualityQuestionCount} questions</strong> on
                <strong> Educational Quality &amp; Student Outcomes</strong>,
                were not included for <strong>Managers</strong> and
                <strong> Office Staff</strong> as they were relevant only for
                teachers
              </span>
            </li>
            <li>
              <span className="survey-structure__dash" />
              <span>
                <strong>
                  {engagementWithManagementQuestionCount} questions
                </strong>{" "}
                on
                <strong> Engagement with Management</strong>, were not included
                for
                <strong> Teachers</strong> and <strong>Office Staff</strong> as
                they were relevant only for Managers
              </span>
            </li>
          </ul>
        </div>
      </div>,
    );

    return out;
  }, [overviewData?.total_response, totalSurveyQuestion]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="survey-feedback-page"
      componentId="survey-feedback"
    />
    // </div>
  );
};

export default SurveyFeedback;
