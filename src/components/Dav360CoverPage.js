import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import "../styles/dav360CoverPage.scss";
import ReportCycle from "../assets/png/davReportCoverImage.png";

const Dav360CoverPage = ({ title = "DAV 360 Degree Feedback\nSummary Report", imageSrc = ReportCycle }) => {
  const blocks = useMemo(() => {
    return [
      <div key="cover" className="dav360-cover">
        <div className="dav360-cover__image-wrap">
          <img className="dav360-cover__image" src={imageSrc} alt="360 feedback" />
        </div>
        <div className="dav360-cover__divider" />
        <div className="dav360-cover__title">{title}</div>
      </div>,
    ];
  }, [imageSrc, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="dav360-cover-page"
      componentId="dav360-cover"
    />
  );
};

export default Dav360CoverPage;
