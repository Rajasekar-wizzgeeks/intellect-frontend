import React, { useMemo, useState, useCallback, useEffect } from "react";
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
  onDataChange,
  savedData,
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
  const getInitialFormData = (saved, prof) => ({
    date: saved?.date ?? prof.date ?? "",
    associateId: saved?.associateId ?? prof.associateId ?? "",
    role: saved?.role ?? prof.role ?? "",
    lob: saved?.lob ?? prof.lob ?? "",
    email: saved?.email ?? prof.email ?? "",
    coachAssociateId: saved?.coachAssociateId ?? "",
    coachRole: saved?.coachRole ?? "",
    coachLob: saved?.coachLob ?? "",
    coachEmail: saved?.coachEmail ?? "",
    period1From: saved?.period1From ?? "",
    period1To: saved?.period1To ?? "",
    period2From: saved?.period2From ?? "",
    period2To: saved?.period2To ?? "",
    reportFeedback: saved?.reportFeedback ?? "",
  });

  const [formData, setFormData] = useState(() => getInitialFormData(savedData, profile));

  useEffect(() => {
    setFormData(getInitialFormData(savedData, profile));
  }, [savedData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (onDataChange) onDataChange(next);
      return next;
    });
  }, [onDataChange]);

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
            <input className="cap-input" type="text" value={formData.date} onChange={(e) => handleFieldChange("date", e.target.value)} />
          </div>
        </div>

        <FormTable
          header={profile.associateName || labels.associateName}
          rows={[
            { label: labels.associateId,  value: formData.associateId },
            { label: labels.role,         value: formData.role },
            { label: labels.lob,          value: formData.lob },
            { label: labels.email,        value: formData.email },
          ]}
          labelWidth={170}
          onChange={(rowIndex, value) => {
            const fields = ["associateId", "role", "lob", "email"];
            handleFieldChange(fields[rowIndex], value);
          }}
        />

        <FormTable
          header={labels.coachName}
          rows={[
            { label: labels.associateId,  value: formData.coachAssociateId },
            { label: labels.role,         value: formData.coachRole },
            { label: labels.lob,          value: formData.coachLob },
            { label: labels.email,        value: formData.coachEmail },
          ]}
          labelWidth={170}
          onChange={(rowIndex, value) => {
            const fields = ["coachAssociateId", "coachRole", "coachLob", "coachEmail"];
            handleFieldChange(fields[rowIndex], value);
          }}
        />

        {/* Coaching Period */}
        <FormTable
          header={labels.coachingPeriod}
          rows={[
            { label: labels.from, value: formData.period1From },
            { label: labels.to,   value: formData.period1To },
          ]}
          labelWidth={170}
          onChange={(rowIndex, value) => {
            const fields = ["period1From", "period1To"];
            handleFieldChange(fields[rowIndex], value);
          }}
        />
        <FormTable
          header={labels.coachingPeriod}
          rows={[
            { label: labels.from, value: formData.period2From },
            { label: labels.to,   value: formData.period2To },
          ]}
          labelWidth={170}
          onChange={(rowIndex, value) => {
            const fields = ["period2From", "period2To"];
            handleFieldChange(fields[rowIndex], value);
          }}
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
            <textarea className="cap-textarea__input" value={formData.reportFeedback} onChange={(e) => handleFieldChange("reportFeedback", e.target.value)} />
          </div>
        </div>
      </div>
    );

    return out;
  }, [titleIndex, titleText, labels, profile, formData, handleFieldChange]);

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
