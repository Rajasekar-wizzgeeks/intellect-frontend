import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/headlinesPage.scss";

const HeadlinesTable = ({ title, rows = [] }) => {
  return (
    <div className="hl-table">
      <div className="hl-table__hdr">{title}</div>
      <div className="hl-table__body">
        {rows.map((r, idx) => (
          <div key={idx} className="hl-row">
            <div className="hl-row__group">{r.group}</div>
            <div className="hl-row__items">
              {(r.items || []).map((it, i) => (
                <div key={i} className="hl-item">
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HeadlinesPage = ({
  title = "Headlines",
  highestRows = [],
  lowestRows = [],
  notesTitle = "Principals who have rated themselves 5 in most questions :",
  notes = [],
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div key="hl" className="headlines-page">
        <FeedbackCommonHeader title={title} titleWidth={100} />

        <div className="headlines-page__section">
          <div className="headlines-page__bullet-title">
            Highest &amp; Lowest Institutional Averages
          </div>

          <div className="headlines-page__tables">
            <HeadlinesTable title="Highest Institutional Averages" rows={highestRows} />
            <HeadlinesTable title="Lowest Institutional Averages" rows={lowestRows} />
          </div>
        </div>

        {notes?.length ? (
          <div className="headlines-page__section">
            <div className="headlines-page__bullet-title">{notesTitle}</div>
            <div className="headlines-page__notes">
              {notes.map((t, idx) => (
                <div key={idx} className="headlines-page__note">
                  {t}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>,
    );

    return out;
  }, [highestRows, lowestRows, notes, notesTitle, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="headlines-page-container"
      componentId="headlines-page"
    />
  );
};

export default HeadlinesPage;
