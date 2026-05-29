import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/contentPage.scss";
import "../styles/coachingActionPlan.scss";
import FormTable from "./FormTable";

const CoachingActionPlan = ({
  startPage = 49,
  pageWidth = 794,
  pageHeight = 900,
  pagePadding = 10,
  titleIndex = "5.",
  titleText = "Leadership Potential Coaching Action Plan",
  profile = {},
  labels = {
    date: "Date",
    associateName: "Associate Name",
    associateId: "Associate ID",
    role: "Role",
    lob: "LOB / Unit",
    email: "Email id",
    coachName: "Coach Name",
    coachingPeriod: "Coaching Period:",
    from: "From",
    to: "To",
    reportFeedback: "Talent Potential Report Feedback",
  },
}) => {
  const blocks = useMemo(() => {
    const out = [];

    // Title
    out.push(
      <h2 key="title" className="content-page__title cap-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    // Form grid
    out.push(
      <div key="cap1" className="cap cap--padded">
        <div className="cap-row cap-row--tight">
          <div className="cap-label cap-label--green">{labels.date}</div>
          <div className="cap-cell">
            <input className="cap-input" type="text" defaultValue={profile.date ?? ""} />
          </div>
        </div>

        <FormTable
          header={profile.associateName || labels.associateName}
          rows={[
            { label: labels.associateId,  value: profile.associateId  ?? "" },
            { label: labels.role,         value: profile.role         ?? "" },
            { label: labels.lob,          value: profile.lob          ?? "" },
            { label: labels.email,        value: profile.email        ?? "" },
          ]}
          labelWidth={170}
        />

        <FormTable
          header={labels.coachName}
          rows={[
            { label: labels.associateId,  value: "" },
            { label: labels.role,         value: "" },
            { label: labels.lob,          value: "" },
            { label: labels.email,        value: "" },
          ]}
          labelWidth={170}
        />

        {/* Coaching Period */}
        <FormTable
          header={labels.coachingPeriod}
          rows={[
            { label: labels.from, value: "" },
            { label: labels.to,   value: "" },
          ]}
          labelWidth={170}
        />
        <FormTable
          header={labels.coachingPeriod}
          rows={[
            { label: labels.from, value: "" },
            { label: labels.to,   value: "" },
          ]}
          labelWidth={170}
        />
      </div>
    );

    out.push(
      <div key="cap2" className="cap cap--padded">
        <div className="cap-block">
          <div className="cap-block__header cap-label--green cap-block-box-border">
            {labels.reportFeedback}
          </div>
          <div className="cap-textarea">
            <textarea className="cap-textarea__input" defaultValue="" />
          </div>
        </div>
      </div>
    );

    return out;
  }, [titleIndex, titleText, labels, profile]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // paddingLeft={40}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default CoachingActionPlan;
