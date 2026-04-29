import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import CompetencyRangeChart from "./CompetencyRangeChart";
import "../styles/summaryByCompetencyInstitutionPage.scss";

const SummaryByCompetencyInstitutionPage = ({
  title = "Summary by Competency for the Institution",
  items = [],
  minX = 1,
  maxX = 5,
  footnote = "*Excludes Self ratings for calculation of min, max and average",
}) => {
  const blocks = useMemo(() => {
    return [
      <div key="sbi" className="sbi-page">
        <FeedbackCommonHeader title={title} titleWidth={100} />
        <div className="sbi-page__chart">
          <CompetencyRangeChart items={items} minX={minX} maxX={maxX} />
        </div>
        {footnote ? <div className="sbi-page__footnote">{footnote}</div> : null}
      </div>,
    ];
  }, [footnote, items, maxX, minX, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="summary-by-competency-institution-page"
      componentId="summary-by-competency-institution"
    />
  );
};

export default SummaryByCompetencyInstitutionPage;
