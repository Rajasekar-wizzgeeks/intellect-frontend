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
        chip: "Section 4 – How to Read This Report",
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
        chip: "Section 5 – How to Read This Report",
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
