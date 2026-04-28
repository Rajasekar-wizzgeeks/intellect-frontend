import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import HorizontalCompareBar from "./HorizontalCompareBar";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/evaluatorCategoryBreakdown.scss";

const PALETTE = {
  self: "#0e4a2e",
  manager: "#b8860b",
  team: "#b3792e",
  peers: "#a9d0b8",
};

const EvaluatorCategoryBreakdown = ({
  startPage = 15,
  pageWidth = 794,
  pageHeight = 852,
  pagePadding = 10,
  items = [],
}) => {
  const initialRows = useMemo(() => items, [items]);
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title ecb-title">
        <span className="content-page__title-index">2.4.</span>
        <span className="content-page__title-text">
          LBSCORE Broken Down by Evaluator Category
        </span>
      </h2>
    );

    out.push(
      <div key="note" className="ecb-note">
        <em className="ecb-note__em">
          <strong> Note:</strong> For categories with more than one respondent,
          scores represent the mean of all individual ratings.
        </em>
      </div>
    );

    rows.forEach((row, idx) => {
      out.push(
        <div
          key={`sec-${idx}`}
          className={`ecb-sec ${idx === 0 ? "ecb-sec--first" : ""}`}
        >
          <h3 className="ecb-sec__heading">
            {idx === 0
              ? `Overall Rating: ${row.label}`
              : `Rating: ${row.label}`}
          </h3>
          <div className="ecb-grid">
            <HorizontalCompareBar
              rows={[
                { label: "Self", value: row.values.self, color: PALETTE.self },
                { label: "Manager", value: row.values.manager, color: PALETTE.manager },
                {
                  label: "Team Members",
                  value: row.values.team,
                  color: PALETTE.team,
                },
                { label: "Peers", value: row.values.peers, color: PALETTE.peers },
              ]}
              max={5}
              showTicks={true}
              editableValues={true}
              onRowsChange={(nextBarRows) => {
                setRows((prev) => {
                  const next = [...prev];
                  const cur = next[idx];
                  if (!cur) return prev;

                  const getVal = (label) =>
                    nextBarRows?.find((r) => r.label === label)?.value;

                  next[idx] = {
                    ...cur,
                    values: {
                      ...cur.values,
                      self: getVal("Self") ?? cur.values.self,
                      manager: getVal("Manager") ?? cur.values.manager,
                      team: getVal("Team Members") ?? cur.values.team,
                      peers: getVal("Peers") ?? cur.values.peers,
                    },
                  };

                  return next;
                });
              }}
            />
          </div>
        </div>
      );
    });

    return out;
  }, [rows]);

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

export default EvaluatorCategoryBreakdown;
