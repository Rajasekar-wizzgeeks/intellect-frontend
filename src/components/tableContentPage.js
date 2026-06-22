import React from "react";
import Header from "./header";
import "../styles/tableContentPage.scss";

const defaultToc = [
  {
    label: "Introduction",
    page: 2,
    tocId: "toc-introduction",
    children: [
      { label: "About the Assessment - LBSCORE 360°", page: 4, tocId: "toc-about-assessment" },
      { label: "About the Sections", page: 6, tocId: "toc-about-sections" },
      { label: "Scoring Definition & Rating Scale", page: 8, tocId: "toc-scoring-definition" },
      { label: "LBSCORE Element Snapshot", page: 10, tocId: "toc-element-snapshot" },
    ],
  },
  {
    label: "Competency Summary",
    page: 12,
    tocId: "toc-competency-summary",
    children: [
      { label: "Your Overall Score", page: 12, tocId: "toc-overall-score" },
      { label: "Overview/Summary of Scores Across 7 Elements", page: 13, tocId: "toc-overview-summary" },
      { label: "LBSCORE Element Summary – Spider Chart", page: 14, tocId: "toc-spider-chart" },
      { label: "LBSCORE Broken Down by Evaluator Category", page: 15, tocId: "toc-evaluator-breakdown" },
      { label: "LBSCORE Broken Down by Behavioural Indicators", page: 17, tocId: "toc-behavioural-indicators" },
      { label: "Participant and Cohort Summary", page: 30, tocId: "toc-participant-cohort" },
    ],
  },
  {
    label: "Qualitative Feedback",
    page: 31,
    tocId: "toc-qualitative-intro",
    children: [
      { label: "Leadership", page: 32, tocId: "toc-qual-leadership" },
      { label: "Bandwidth", page: 34, tocId: "toc-qual-bandwidth" },
      { label: "Sales & Customer Centricity", page: 36, tocId: "toc-qual-sales" },
      { label: "Collaboration", page: 38, tocId: "toc-qual-collaboration" },
      { label: "Operational Excellence", page: 40, tocId: "toc-qual-operational" },
      { label: "Results Orientation", page: 42, tocId: "toc-qual-results" },
      { label: "Expertise & Communication", page: 44, tocId: "toc-qual-expertise" },
    ],
  },
  {
    label: "Highlights",
    page: 46,
    tocId: "toc-highlights",
    children: [
      { label: "Strengths", page: 46, tocId: "toc-strengths" },
      { label: "Areas of Improvement", page: 47, tocId: "toc-areas-improvement" },
      { label: "Hidden Strengths", page: 48, tocId: "toc-hidden-strengths" },
      { label: "Blind spots", page: 49, tocId: "toc-blind-spots" },
    ],
  },
  {
    label: "Leadership Potential Coaching Action Plan",
    page: 50,
    tocId: "toc-coaching-plan",
    children: [],
  },
  {
    label: "Individual Developmental Plan",
    page: 52,
    tocId: "toc-dev-plan",
    children: [],
  },
];

const TableContentPage = ({ items = defaultToc, pageNumberMap = {} }) => {
  const renderLevel = (nodes, level = 1, prefix = "") => (
    <ol className={`toc__list toc__list--lvl${level}`}>
      {nodes.map((n, idx) => {
        const number = prefix ? `${prefix}${idx + 1}.` : `${idx + 1}.`;
        const dynamicPage = n.tocId ? (pageNumberMap[n.tocId] ?? n.page) : n.page;
        return (
          <li key={`${number}-${n.label}`} className="toc__item">
            <div className="toc__row">
              <span className="toc__label">
                <span className="toc__num">{number}</span>
                <span className="toc__text">{n.label}</span>
              </span>
              {/* <span className="toc__dots" aria-hidden="true" /> */}
              <span className="toc__page">{dynamicPage}</span>
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
