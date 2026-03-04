import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import FeedbackBubble from "./FeedbackBubble";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";

const THEME = {
  green: {
    borderColor: "#123b2b",
    avatarBg: "#0e4a2e",
    bubbleColor: "#ffffff",
    textColor: "#333",
  },
  gold: {
    borderColor: "#cc8b2c",
    avatarBg: "#cc8b2c",
    bubbleColor: "#ffffff",
    textColor: "#333",
  },
};

const QualitativeFeedbackSection = ({
  startPage = 31,
  pageWidth = 794,
  pageHeight = 902,
  pagePadding = 10,
  // Title
  titleIndex = "3.1.",
  titleText = "Leadership",
  // Question prompt
  questionIndex = "1.",
  questionText = "What do you consider the key leadership strengths demonstrated by the Participant?",
  // Comments: accepts array of strings OR array of objects { text?, value?, readOnly?, placeholder?, rows? }
  comments = ["Sample", "Sample", "Sample"],
  // Color theme: 'green' | 'gold' or custom overrides
  colorTheme = "green",
  borderColor: borderOverride,
  avatarBg: avatarOverride,
  bubbleColor: bubbleOverride,
  textColor: textOverride,
}) => {
  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <h2
        key="title"
        className="content-page__title"
        style={{ color: "#0e4a2e" }}
      >
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    out.push(
      <div
        key="q"
        style={{
          marginTop: 4,
          marginBottom: 6,
          color: "#0e4a2e",
          fontWeight: 700,
          paddingLeft: 4,
        }}
      >
        <span style={{ marginRight: 8 }}>{questionIndex}</span>
        <span style={{ color: "#0e4a2e" }}>{questionText}</span>
      </div>
    );

    const theme = THEME[colorTheme] || THEME.green;
    const borderColor = borderOverride || theme.borderColor;
    const avatarBg = avatarOverride || theme.avatarBg;
    const bubbleColor = bubbleOverride || theme.bubbleColor;
    const textColor = textOverride || theme.textColor;

    const normalized = (comments || []).map((c) =>
      typeof c === "string"
        ? { text: c }
        : {
            text: c.text,
            value: c.value,
            readOnly: !!c.readOnly,
            placeholder: c.placeholder,
            rows: c.rows,
          }
    );

    out.push(
      <div
        key="list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {normalized.map((item, i) => (
          <FeedbackBubble
            key={i}
            text={item.text || ""}
            value={item.value}
            readOnly={item.readOnly}
            placeholder={item.placeholder}
            rows={item.rows || 1}
            compact={true}
            bubbleColor={bubbleColor}
            borderColor={borderColor}
            avatarBg={avatarBg}
            textColor={textColor}
          />
        ))}
      </div>
    );

    return out;
  }, [
    titleIndex,
    titleText,
    questionIndex,
    questionText,
    comments,
    colorTheme,
    borderOverride,
    avatarOverride,
    bubbleOverride,
    textOverride,
  ]);

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

export default QualitativeFeedbackSection;
