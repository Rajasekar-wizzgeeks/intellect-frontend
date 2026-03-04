import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import FeedbackBubble from "./FeedbackBubble";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/qualitativeFeedbackList.scss";
import greenPersonIcon from "../assets/png/greenPersonIcon.png";
import yellowPersonIcon from "../assets/png/yellowPersonIcon.png";

const THEME = {
  green: {
    borderColor: "var(--color-green)",
    avatarBg: "var(--color-green)",
    bubbleColor: "var(--color-white)",
    textColor: "var(--color-text)",
    icon: greenPersonIcon,
  },
  gold: {
    borderColor: "var(--color-gold)",
    avatarBg: "var(--color-gold)",
    bubbleColor: "var(--color-white)",
    textColor: "var(--color-text)",
    icon: yellowPersonIcon,
  },
};

const QualitativeFeedbackList = ({
  startPage = 31,
  pageWidth = 794,
  pageHeight = 900,
  pagePadding = 10,
  titleIndex = "3.1.",
  titleText = "Leadership",
  questions = [],
}) => {
  const blocks = useMemo(() => {
    const out = [];

    // Title
    out.push(
      <h2 key="title" className="content-page__title qfl-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    questions.forEach((q, qi) => {
      const theme = THEME[q.colorTheme] || THEME.green;
      out.push(
        <div
          key={`q-${qi}`}
          className={`qfl-question ${qi === 0 ? "qfl-question--first" : ""}`}
        >
          <div className="qfl-question__header">
            <span className="qfl-question__index">
              {q.index || `${qi + 1}.`}
            </span>
            <span>{q.text}</span>
          </div>
          <div className="qfl-comments">
            {(q.comments || []).map((c, i) => (
              <FeedbackBubble
                key={i}
                text={typeof c === "string" ? c : c?.text || ""}
                compact={true}
                bubbleColor={theme.bubbleColor}
                borderColor={theme.borderColor}
                avatarBg={theme.avatarBg}
                textColor={theme.textColor}
                icon={
                  <img
                    src={theme.icon}
                    alt="Person"
                    style={
                      q.colorTheme === "green"
                        ? { width: "42px", height: "40px" }
                        : { width: "48px", height: "45px" }
                    }
                  />
                }
              />
            ))}
          </div>
        </div>
      );
    });

    return out;
  }, [titleIndex, titleText, questions]);

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

export default QualitativeFeedbackList;
