import React from "react";
import Header from "./header";
import "../styles/tableContentPage.scss";

const defaultToc = [
  {
    label: "Introduction",
    page: 2,
    children: [
      { label: "About the Assessment - LBSCORE 360°", page: 4 },
      { label: "About the Sections", page: 6 },
      { label: "Scoring Definition & Rating Scale", page: 8 },
      { label: "LBSCORE Element Snapshot", page: 10 },
    ],
  },
  {
    label: "Competency Summary",
    page: 12,
    children: [
      { label: "Your Overall Score", page: 12 },
      { label: "Overview/Summary of Scores Across 7 Elements", page: 13 },
      { label: "LBSCORE Element Summary – Spider Chart", page: 14 },
      { label: "LBSCORE Broken Down by Evaluator Category", page: 15 },
      { label: "LBSCORE Broken Down by Behavioural Indicators", page: 17 },
      { label: "Participant and Cohort Summary", page: 30 },
    ],
  },
  {
    label: "Qualitative Feedback",
    page: 31,
    children: [
      { label: "Leadership", page: 32 },
      { label: "Bandwidth", page: 34 },
      { label: "Sales & Customer Centricity", page: 36 },
      { label: "Collaboration", page: 38 },
      { label: "Operational Excellence", page: 40 },
      { label: "Results Orientation", page: 42 },
      { label: "Expertise & Communication", page: 44 },
    ],
  },
  {
    label: "Highlights",
    page: 46,
    children: [
      { label: "Strengths", page: 46 },
      { label: "Areas of Improvement", page: 47 },
      { label: "Hidden Strengths", page: 48 },
      { label: "Blind spots", page: 49 },
    ],
  },
  {
    label: "Leadership Potential Coaching Action Plan",
    page: 50,
    children: [],
  },
  {
    label: "Individual Developmental Plan",
    page: 52,
    children: [],
  },
];

const TableContentPage = ({ items = defaultToc }) => {
  const renderLevel = (nodes, level = 1, prefix = "") => (
    <ol className={`toc__list toc__list--lvl${level}`}>
      {nodes.map((n, idx) => {
        const number = prefix ? `${prefix}${idx + 1}.` : `${idx + 1}.`;
        return (
          <li key={`${number}-${n.label}`} className="toc__item">
            <div className="toc__row">
              <span className="toc__label">
                <span className="toc__num">{number}</span>
                <span className="toc__text">{n.label}</span>
              </span>
              {/* <span className="toc__dots" aria-hidden="true" /> */}
              <span className="toc__page">{n.page}</span>
            </div>
            {n.children &&
              n.children.length > 0 &&
              renderLevel(n.children, level + 1, `${number}`)}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="content-page">
      <Header />

      <div className="toc">
        <h2 className="toc__suptitle">Table of Contents</h2>
        <h1 className="toc__title">Contents</h1>

        {renderLevel(items)}
      </div>
    </div>
  );
};

export default TableContentPage;
