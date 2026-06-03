import React, { useMemo } from "react";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/aboutAssessment.scss"; // extend with section styles
import Header from "./header";
import AutoPaginatedSections from "./AutoPaginatedSections";
import SectionChip from "./SectionChip";

const AboutSectionPages = ({
  startPage = 6,
  pageWidth = 794,
  pageHeight = 802,
  pagePadding = 10,
  titleIndex = "1.2.",
  titleText = "About the Sections",
  sections: sectionsProp,
}) => {
  const defaultSections = useMemo(
    () => [
      {
        chip: "Section 1 – How to Read This Report",
        items: [
          {
            lead: "Associate Profile",
            tail: "Displays your name, role, business unit, and the date the survey closed.",
          },
          {
            lead: "About the Tool",
            tail: "Explains what LBSCORE 360° measures, why multi-rater feedback matters, and the minimum number of raters required for each group.",
          },
          {
            lead: "Scoring Framework",
            tail: "Demystifies the 1-to-5 scale (Gap → Competence).",
          },
          {
            lead: "LBSCORE Elements",
            tail: "Gives a one-sentence definition of each of the seven pillars.",
          },
          {
            lead: "Report Map",
            tail: "A quick guide to the remaining sections so you know where to look for what.",
          },
        ],
      },
      {
        chip: "Section 2 – Big-Picture Scores",
        items: [
          {
            lead: "Element Heat-map",
            tail: "Side-by-side averages for each LBSCORE element (Self vs. All Others).",
          },
          {
            lead: "Spider Chart",
            tail: "A visual of the same data for instant pattern spotting.",
          },
          {
            lead: "Benchmark",
            tail: "Shows where your overall score sits against the cohort as well as your Stream participants",
          },
        ],
      },
      {
        chip: "Section 3 – Deep Dive on Behaviour",
        items: [
          {
            lead: "Element-by-Rater View",
            tail: "Breaks down every LBSCORE element by each evaluator category and flags any significant self/other gaps.",
          },
          {
            lead: "Behavioural Indicators",
            tail: "Presents the 7–8 survey statements under each element, with ranges, ratings, and colour-coded gaps.",
          },
          {
            lead: "Qualitative Comments",
            tail: "Groups open-ended feedback into strengths and opportunities for each element.",
          },
        ],
      },
      {
        chip: "Section 4 – Insight Highlights",
        items: [
          {
            lead: "Strengths",
            tail: <>Statements where <strong>all raters (Self &amp; Others)</strong> scored you <strong>highest (≈ 3.5 or above).</strong></>,
          },
          {
            lead: "Areas for Improvement",
            tail: <>Statements where scores are <strong>lowest (Self ≈ 3.0 or below and Others ≈ 3.5 or below).</strong></>,
          },
          {
            lead: "Hidden Strengths",
            tail: <>Behaviours / competencies where you have rated yourself lower than others, with a difference of <strong>≥ 0.5 point</strong> between your self-rating and the rating given by other raters. These are highlighted only when <strong>your self-rating is ≤ 3 and others-rating is &gt;3.5</strong>, meaning you already demonstrate strength in this area but tend to <strong>underrate yourself</strong> relative to how others experience you.</>,
          },
          {
            lead: "Blind Spots",
            tail: <>Behaviours / competencies where you have rated yourself higher than others, with a difference of <strong>≥ 0.5 point</strong> between your self-rating and the rating given by other raters. These are highlighted only when <strong>your self-rating is ≥ 3.5 and others rating is ≤ 3</strong>, indicating areas where you may be <strong>overestimating your effectiveness</strong> compared to how others experience you.</>,
          },
          {
            lead: "Proficient",
            tail: <>If the <strong>self-rating is &gt; 3 and the Others&rsquo; rating</strong> falls <strong>between &gt; 3 and &lt; 3.5, the competency will not be mapped to any of the four categories.</strong> Instead, it will be categorized as <strong>&ldquo;Proficient&rdquo;</strong>, indicating that <strong>the participant demonstrates capability in the competency with additional scope for improvement.</strong></>,
          },
        ],
      },
      {
        chip: "Section 5 – Development Planning",
        items: [
          {
            lead: "Leadership-Potential Coaching Plan",
            tail: "A two-page reflection worksheet to discuss with your manager or coach.",
          },
          {
            lead: "Individual Development Plan (IDP)",
            tail: "Sets SMART goals, concrete actions, resources, and timelines, with direct links to Learning Path Tool content for the behaviours that need the most attention.",
          },
        ],
      },
    ],
    []
  );

  const sections =
    sectionsProp && sectionsProp.length ? sectionsProp : defaultSections;

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title-sections" className="about-title">
        <span className="about-title__num">{titleIndex}</span>
        <span className="about-title__text">{titleText}</span>
      </h2>
    );

    sections.forEach((s, idx) => {
      out.push(
        <div key={`sec-${idx}`} className="about-sections__group">
          <SectionChip text={s.chip} />
          <ul className="about-sections__list">
            {s.items.map((it, i) => (
              <li key={i} className="about-sections__item">
                <span className="about-sections__lead">{it.lead}</span>
                <span className="about-sections__tail">
                  {it.lead && " - "} {it.tail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    });

    return out;
  }, [sections, titleIndex, titleText]);

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

export default AboutSectionPages;
