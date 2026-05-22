import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import FeedbackBubble from "./FeedbackBubble";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/qualitativeFeedbackList.scss";
import greenPersonIcon from "../assets/png/greenPersonIcon.png";
import yellowPersonIcon from "../assets/png/yellowPersonIcon.png";
import measurementManager from "./measurementManager";

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
  onDataChange,
}) => {
  const measurementId = useRef(
    `qfl-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const [chunks, setChunks] = useState(null);
  const [localQuestions, setLocalQuestions] = useState(questions);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const handleCommentChange = (qi, ci, newVal) => {
    const nextQuestions = [...localQuestions];
    const q = { ...nextQuestions[qi] };
    const nextComments = [...q.comments];
    nextComments[ci] = newVal;
    q.comments = nextComments;
    nextQuestions[qi] = q;
    setLocalQuestions(nextQuestions);
    if (onDataChange) {
      onDataChange(nextQuestions);
    }
  };

  const flatItems = useMemo(() => {
    const out = [];

    out.push(
      <h2 key="title" className="content-page__title qfl-title">
        <span className="content-page__title-index">{titleIndex}</span>
        <span className="content-page__title-text">{titleText}</span>
      </h2>
    );

    localQuestions.forEach((q, qi) => {
      const theme = THEME[q.colorTheme] || THEME.green;

      const headerEl = (
        <div
          key={`qh-${qi}`}
          className={`qfl-question ${qi === 0 ? "qfl-question--first" : ""}`}
        >
          <div className="qfl-question__header">
            <span className="qfl-question__index">
              {q.index || `${qi + 1}.`}
            </span>
            <span>{q.text}</span>
          </div>
        </div>
      );

      const comments = Array.isArray(q.comments) ? q.comments : [];
      comments.forEach((c, i) => {
        const commentEl = (
          <div key={`qc-${qi}-${i}`} className="qfl-comment-block">
            <FeedbackBubble
              text={typeof c === "string" ? c : c?.text || ""}
              compact={true}
              bubbleColor={theme.bubbleColor}
              borderColor={theme.borderColor}
              avatarBg={theme.avatarBg}
              textColor={theme.textColor}
              value={typeof c === "string" ? c : c?.text || ""}
              onChange={(e) => {}} // dummy to enable editing in bubble
              onBlur={(val) => handleCommentChange(qi, i, val)}
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
          </div>
        );

        if (i === 0) {
          out.push(
            <React.Fragment key={`qhc-${qi}`}
              >{headerEl}{commentEl}</React.Fragment>
          );
        } else {
          out.push(commentEl);
        }
      });

      if (comments.length === 0) {
        out.push(headerEl);
      }
    });

    return out;
  }, [titleIndex, titleText, localQuestions]);

  useEffect(() => {
    const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
    if (!isBrowser) return;

    let cancelled = false;

    const PAGE_HEIGHT = 1123;
    const PAGE_WIDTH = pageWidth;

    const resolvedPaddingTop = 0;
    const resolvedPaddingBottom = 70;
    const resolvedPaddingLeft = 0;
    const resolvedPaddingRight = 0;
    const USABLE_HEIGHT =
      PAGE_HEIGHT - resolvedPaddingTop - resolvedPaddingBottom;

    const renderMeasure = async ({ startIdx, endIdx }) => {
      return new Promise((resolve) => {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.visibility = "hidden";
        container.style.width = `${PAGE_WIDTH}px`;
        container.style.left = "-100000px";
        container.style.top = "0";
        container.style.zIndex = "-9999";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);

        const root = createRoot(container);

        const boundedStart = Math.min(Math.max(0, startIdx), flatItems.length);
        const boundedEnd = Math.min(Math.max(boundedStart, endIdx), flatItems.length);
        const slice = flatItems.slice(boundedStart, boundedEnd);

        root.render(
          <div
            style={{
              paddingTop: resolvedPaddingTop,
              paddingBottom: resolvedPaddingBottom,
              paddingLeft: resolvedPaddingLeft,
              paddingRight: resolvedPaddingRight,
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <div className="content-page">
              <Header />
              {slice.map((el, idx) => (
                <div key={`m-${boundedStart}-${idx}`}>{el}</div>
              ))}
            </div>
          </div>
        );

        const measure = async () => {
          try {
            if (document.fonts?.ready) await document.fonts.ready;
            await new Promise((r) => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(r);
                });
              });
            });

            await new Promise((r) => setTimeout(r, 30));

            const content = container.firstElementChild;
            const rect = content?.getBoundingClientRect();
            resolve(Math.ceil(rect?.height || 0));
          } catch {
            resolve(0);
          } finally {
            try {
              root.unmount();
            } catch {}
            container.remove();
          }
        };

        setTimeout(measure, 30);
      });
    };

    const buildChunks = async () => {
      const maxLen = flatItems.length;
      if (!maxLen) {
        setChunks([]);
        return;
      }

      const nextChunks = [];
      let start = 0;

      while (start < maxLen) {
        let lo = start + 1;
        let hi = maxLen;
        let best = lo;

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (mid <= start) {
            lo = start + 1;
            continue;
          }

          const h = await renderMeasure({ startIdx: start, endIdx: mid });
          if (h > 0 && h <= USABLE_HEIGHT) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }

        if (best <= start) best = start + 1;
        nextChunks.push({ start, end: best });
        start = best;
      }

      if (!cancelled) setChunks(nextChunks);
    };

    const run = async () => {
      setChunks(null);
      await measurementManager.addToQueue(measurementId.current, async () => {
        if (cancelled) return;
        await buildChunks();
      });
    };

    run();

    return () => {
      cancelled = true;
      measurementManager.removeFromQueue(measurementId.current);
    };
  }, [flatItems, pageWidth]);

  const blocks = useMemo(() => {
    const resolvedChunks = Array.isArray(chunks)
      ? chunks
      : [{ start: 0, end: flatItems.length }];

    return resolvedChunks.map((chunk, chunkIdx) => (
      <div
        key={`qfl-${chunkIdx}`}
        data-force-page-break="before"
        style={{ breakBefore: "page", pageBreakBefore: "always" }}
      >
        {flatItems.slice(chunk.start, chunk.end).map((el, idx) => (
          <React.Fragment key={`qfl-el-${chunkIdx}-${idx}`}>{el}</React.Fragment>
        ))}
      </div>
    ));
  }, [chunks, flatItems]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      pageWidth={pageWidth}
      pageHeight={1123}
      pagePadding={0}
      pagePaddingTop={0}
      pagePaddingBottom={70}
      HeaderComponent={Header}
      contentClassName="content-page"
      componentId={measurementId.current}
    />
  );
};

export default QualitativeFeedbackList;
