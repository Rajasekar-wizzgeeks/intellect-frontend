import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import DavCommonHeader from "./DavCommonHeader";
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
      <div key="sbi-header">
        <DavCommonHeader title={title} />
      </div>,
      <div key="sbi-chart" className="sbi-page__chart">
        <CompetencyRangeChart items={items} minX={minX} maxX={maxX} showTitle={false} />
      </div>,
      /* {footnote ? <div key="sbi-footnote" className="sbi-page__footnote">{footnote}</div> : null} */
    ];
  }, [items, maxX, minX, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="sbi-page"
      pageClassName="dav360-page"
      componentId="summary-by-competency-institution"
    />
  );
};

export default SummaryByCompetencyInstitutionPage;
