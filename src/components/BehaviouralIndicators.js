import React, { useMemo, useState, useEffect } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import EvaluatorRatingsTable from "./EvaluatorRatingsTable";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/behaviouralIndicators.scss";

const BehaviouralIndicators = ({
  startPage = 17,
  pageWidth = 794,
  pageHeight = 952,
  pagePadding = 10,
  note = "For categories with more than one respondent, scores represent the mean of all individual ratings.",
  items = [],
  onDataChange,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const componentId = useMemo(
    () => `behavioural-${startPage}-${Date.now()}`,
    [startPage]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, Math.random() * 150);

    return () => clearTimeout(timer);
  }, []);

  const blocks = useMemo(() => {
    if (!isMounted) return [];

    const out = [];

    // Title block
    out.push(
      <div key="title" className="bi-title-wrap">
        <h2 className="content-page__title bi-title">
          <span className="content-page__title-index bi-title__index">
            2.5.
          </span>
          <span className="content-page__title-text">
            LBSCORE Broken Down by Behavioural Indicators
          </span>
        </h2>
      </div>
    );

    // Note
    out.push(
      <div key="note" className="bi-note">
        <em className="bi-note__em">
          <strong>Note: </strong> {note}
        </em>
      </div>
    );

    items.forEach((item, idx) => {
      out.push(
        <div key={`ind-${idx}`} className="bi-indicator">
          <div className="bi-indicator__header">
            <span className="bi-indicator__label">{idx + 1}.</span>
            <span className="bi-indicator__text">{item.indicator}</span>
          </div>
          <div className="bi-table-wrap">
            <EvaluatorRatingsTable
              title={`Indicator ${idx + 1}`}
              rows={[
                {
                  label: "Self",
                  score: item.self,
                  gapFromSelf: 0,
                  highlight: item.highlight ?? "",
                  color: "#b3792e",
                },
                ...item.others,
              ]}
              compact={true}
              onDataChange={(newRows) => {
                if (onDataChange) {
                  onDataChange(idx, newRows);
                }
              }}
            />
          </div>
        </div>
      );
    });

    return out;
  }, [items, note, isMounted]);

  if (!isMounted) {
    return (
      <section
        className="section-page pdf-section"
        style={{ padding: pagePadding }}
      >
        <div className="content-page">
          <div className="bi-loading">Loading behavioural indicators...</div>
        </div>
      </section>
    );
  }

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      pageWidth={pageWidth}
      pageHeight={pageHeight}
      pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
      componentId={componentId}
    />
  );
};

export default BehaviouralIndicators;
