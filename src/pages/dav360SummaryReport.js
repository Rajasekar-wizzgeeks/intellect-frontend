import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { downloadPdfSplitByHeader } from "../utils/pdf";
import Dav360CoverPage from "../components/Dav360CoverPage";
import HeadlinesPage from "../components/HeadlinesPage";
import SummaryByCompetencyInstitutionPage from "../components/SummaryByCompetencyInstitutionPage";
import OverallAveragesByPrincipalPage from "../components/OverallAveragesByPrincipalPage";
import FrequentlyOccuringSuggestions from "../components/frequentlyOccuringSuggestions"
import LeaderComparisonPage from "../components/leaderComparisionPage"
import "../styles/feedback360Report.scss";

const Dav360SummaryReport = () => {
  const { setHeaderName } = useOutletContext();

  useEffect(() => {
    setHeaderName("DAV 360 Report");
  }, [setHeaderName]);

  const highestRows = [
    { group: "Leadership", items: ["Visionary Leadership - 4.85", "Strategic Planning - 4.72", "Decision Making - 4.68"] },
    { group: "Communication", items: ["Clarity of Expression - 4.55", "Active Listening - 4.48", "Feedback Provision - 4.42"] },
  ];

  const lowestRows = [
    { group: "Time Management", items: ["Prioritization - 3.12", "Meeting Deadlines - 3.25", "Delegation - 3.38"] },
    { group: "Conflict Resolution", items: ["Handling Disagreements - 3.45", "Negotiation - 3.52", "Problem Solving - 3.68"] },
  ];

  const notes = [
    "Principal Anderson has self-rated 5 in 18 out of 24 questions",
    "Principal Martinez has self-rated 5 in 15 out of 24 questions",
    "Principal Thompson has self-rated 5 in 14 out of 24 questions",
  ];

  const competencyItems = [
    { label: "Visionary Leadership", min: 3.85, max: 4.85, mean: 4.45 },
    { label: "Strategic Planning", min: 3.92, max: 4.72, mean: 4.28 },
    { label: "Communication Skills", min: 3.65, max: 4.55, mean: 4.12 },
    { label: "Team Building", min: 3.45, max: 4.42, mean: 3.95 },
    { label: "Decision Making", min: 3.28, max: 4.68, mean: 4.05 },
    { label: "Conflict Resolution", min: 2.95, max: 4.15, mean: 3.52 },
    { label: "Time Management", min: 2.85, max: 4.25, mean: 3.45 },
    { label: "Accountability", min: 3.55, max: 4.58, mean: 4.08 },
    { label: "Innovation", min: 3.25, max: 4.35, mean: 3.82 },
    { label: "Stakeholder Engagement", min: 3.42, max: 4.48, mean: 3.95 },
  ];

  const teamRows = [
    { name: "Anderson, Sarah", value: 4.65, responses: 24 },
    { name: "Martinez, James", value: 4.42, responses: 22 },
    { name: "Thompson, Emily", value: 4.28, responses: 20 },
    { name: "Williams, Michael", value: 4.15, responses: 18 },
    { name: "Brown, Lisa", value: 3.95, responses: 21 },
    { name: "Davis, Robert", value: 3.82, responses: 19 },
    { name: "Wilson, Jennifer", value: 3.68, responses: 17 },
    { name: "Moore, David", value: 3.55, responses: 16 },
  ];

  const managerRows = [
    { name: "Anderson, Sarah", value: 4.75, responses: 8 },
    { name: "Martinez, James", value: 4.52, responses: 7 },
    { name: "Thompson, Emily", value: 4.38, responses: 6 },
    { name: "Williams, Michael", value: 4.25, responses: 5 },
    { name: "Brown, Lisa", value: 4.08, responses: 6 },
    { name: "Davis, Robert", value: 3.92, responses: 5 },
    { name: "Wilson, Jennifer", value: 3.78, responses: 4 },
    { name: "Moore, David", value: 3.65, responses: 4 },
  ];

  return (
    <div className="feedbackreport-main-container">
      <div className="feedbackreport-toolbar">
        <button
          onClick={downloadPdfSplitByHeader}
          className="feedbackreport-btn feedbackreport-btn--download"
        >
          Download PDF
        </button>
      </div>

      <div className="section-page pdf-section">
        <Dav360CoverPage />
      </div>

      <HeadlinesPage highestRows={highestRows} lowestRows={lowestRows} notes={notes} />

      <SummaryByCompetencyInstitutionPage items={competencyItems} />

      <OverallAveragesByPrincipalPage teamRows={teamRows} managerRows={managerRows} />

      <FrequentlyOccuringSuggestions/>

      <LeaderComparisonPage/>
    </div>
  );
};

export default Dav360SummaryReport;
