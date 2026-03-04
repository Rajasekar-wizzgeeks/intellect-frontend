import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import ParticipantCohortTable from "./ParticipantCohortTable";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/participantCohortSummary.scss";

const ParticipantCohortSummary = ({
  startPage = 26,
  pageWidth = 794,
  pageHeight = 802,
  pagePadding = 10,
  titleIndex = "2.6.",
  titleText = "Participant and Cohort Summary",
  note = (
    <>
      <strong>Cohort Summary</strong> : Cohort will include all the participants
      in that particular Sprint and not Stream wise.
    </>
  ),
  competencies,
  selfRatings,
  cohortRatings,
}) => {
  const [localSelfRatings, setLocalSelfRatings] = useState(selfRatings || {});
  const [localCohortRatings, setLocalCohortRatings] = useState(
    cohortRatings || {}
  );

  useEffect(() => {
    setLocalSelfRatings(selfRatings || {});
  }, [selfRatings]);

  useEffect(() => {
    setLocalCohortRatings(cohortRatings || {});
  }, [cohortRatings]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title pcs-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    out.push(
      <div key="note" className="pcs-note">
        <em className="pcs-note__em">{note}</em>
      </div>
    );

    out.push(
      <div key="table" className="pcs-table">
        <ParticipantCohortTable
          competencies={competencies}
          selfRatings={localSelfRatings}
          cohortRatings={localCohortRatings}
          onSelfRatingsChange={setLocalSelfRatings}
          onCohortRatingsChange={setLocalCohortRatings}
        />
      </div>
    );

    return out;
  }, [
    titleIndex,
    titleText,
    note,
    competencies,
    localSelfRatings,
    localCohortRatings,
  ]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default ParticipantCohortSummary;
