import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/qualitativeFeedbackIntro.scss";

const QualitativeFeedbackIntro = ({
  startPage = 30,
  pageWidth = 794,
  pageHeight = 402,
  pagePadding = 10,
  titleIndex = "3.",
  titleText = "Qualitative Feedback",
  paragraphs = [
    "This section captures open-ended feedback shared by respondents for each leadership element. It surfaces key perceptions about the participant’s strengths and areas of development. When reviewing these insights, look for recurring themes across raters and triangulate them with the numerical ratings from previous sections.",
    "The goal is to interpret this feedback constructively, identifying actionable takeaways and behavioral patterns aligned to each element of the LBSCORE framework.",
  ],
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title qfi-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    out.push(
      <div key="body" className="qfi-body">
        {paragraphs.map((p, i) => (
          <p key={i} className="qfi-paragraph">
            {p}
          </p>
        ))}
      </div>
    );

    return out;
  }, [titleIndex, titleText, paragraphs]);

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

export default QualitativeFeedbackIntro;
