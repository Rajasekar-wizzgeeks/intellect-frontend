import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import "../styles/SectionTitle.scss";

const SectionTitle = ({ children = "3 Highest & Lowest Team Averages By Principal" }) => {
  const blocks = useMemo(() => {
    return [
      <div key="section-title" className="section-title">
        <div className="section-title-circle section-title-circle--lg" />
        <div className="section-title-circle section-title-circle--sm" />
        <div className="section-title-band section-title-band--left" />
        <div className="section-title-band section-title-band--right" />
        <h1 className="section-title-text">{children}</h1>
      </div>,
    ];
  }, [children]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="section-title-page"
      pageClassName="dav360-page"
      componentId="section-title"
    />
  );
}

export default SectionTitle;