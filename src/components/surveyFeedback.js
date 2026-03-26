import React, { useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/surveyFeedback.scss";
import staffPerformanceDevlopment from "../assets/png/staffPerformanceDevlopment.png";
import personality from "../assets/png/personality.png";
import educationalQulaity from "../assets/png/educationalQulaity.png";
import culture from "../assets/png/culture.png";
import management from "../assets/png/management.png";

const EditableCount = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));

  const commit = () => {
    const raw = String(draft ?? "").trim();
    const next = raw === "" ? null : Number.parseInt(raw, 10);
    if (next === null) {
      onChange(null);
    } else if (Number.isFinite(next) && next >= 0) {
      onChange(next);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(String(value ?? ""));
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <span
        onDoubleClick={(e) => {
          e.stopPropagation();
          setDraft(String(value ?? ""));
          setIsEditing(true);
        }}
        style={{ cursor: "pointer" }}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      autoFocus
      inputMode="numeric"
      style={{
        width: "3ch",
        border: "none",
        outline: "none",
        background: "transparent",
        padding: 0,
        margin: 0,
        font: "inherit",
        color: "inherit",
      }}
    />
  );
};

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

  const [surveyQuestionOverride, setSurveyQuestionOverride] = useState(null);
  const [qualitativeQuestionOverride, setQualitativeQuestionOverride] =
    useState(null);

  const effectiveSurveyQuestionCount =
    surveyQuestionOverride ?? totalSurveyQuestion;
  const effectiveQualitativeQuestionCount =
    qualitativeQuestionOverride ?? qualitativeQuestionCount;
  const effectiveTotalQuestionCount =
    effectiveSurveyQuestionCount + effectiveQualitativeQuestionCount;

  const setTotalQuestionCount = (nextTotal) => {
    if (nextTotal === null || nextTotal === undefined) {
      setSurveyQuestionOverride(null);
      setQualitativeQuestionOverride(null);
      return;
    }

    const baseQual =
      qualitativeQuestionOverride ?? qualitativeQuestionCount;
    const nextSurvey = Math.max(0, Number(nextTotal) - Number(baseQual));
    setSurveyQuestionOverride(nextSurvey);
  };

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
              Feedback provided by each Respondent -
            </li>
          </ul>
          <ul className="survey-feedback-subpoints">
            <li>
              Extent of agreement on a scale of 1 to 5 (1- Strongly Disagree, 2-Disagree, 3- No View, 4-Agree, 5-Strongly Agree)
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
              <strong>
                <EditableCount
                  value={effectiveTotalQuestionCount}
                  onChange={setTotalQuestionCount}
                />
              </strong>{" "}
              (
              <EditableCount
                value={effectiveSurveyQuestionCount}
                onChange={setSurveyQuestionOverride}
              />{" "}
              survey questions +{" "}
              <EditableCount
                value={effectiveQualitativeQuestionCount}
                onChange={setQualitativeQuestionOverride}
              />{" "}
              qualitative questions)
            </li>
          </ul>

          <ul className="survey-feedback-subpoints survey-structure__sub">
            <li>
              The <strong>{effectiveSurveyQuestionCount} survey questions</strong> were
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
  }, [
    overviewData?.total_response,
    totalSurveyQuestion,
    effectiveSurveyQuestionCount,
    effectiveQualitativeQuestionCount,
    effectiveTotalQuestionCount,
  ]);

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
