import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/leaderComparisionPage.scss";

const LeaderCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="lcp-card">
      <div className="lcp-header">{data.name}</div>
      <div className="lcp-sub">Team Responses # {data.responses}</div>

      <div className="lcp-layout">
        {/* AXIS (spans full height) */}
        <div className="lcp-axis">
          <div className="lcp-axis__label lcp-axis__label--top">
            Highest Averages
          </div>
          <div className="lcp-axis__label lcp-axis__label--bottom">
            Lowest Averages
          </div>
          <div className="lcp-axis__line" />
          <div className="lcp-axis__arrow lcp-axis__arrow--up" />
          <div className="lcp-axis__arrow lcp-axis__arrow--down" />
          <div className="lcp-axis__diamond" />
        </div>

        {/* MAIN + RIGHT are a single grid to keep alignment */}
        <div className="lcp-content">
          {/* LEFT MAIN */}
          <div className="lcp-main">
            {/* TOP (GREEN) */}
            <div className="lcp-box lcp-box--top">
              {data.topItems.map((r, i) => (
                <div key={i} className="lcp-row">
                  <div className="lcp-text">{r.text}</div>
                  <div className="lcp-score">{r.score}</div>
                </div>
              ))}
            </div>

            {/* MID LINE (shared baseline with right panel) */}
            <div className="lcp-midline" />

            {/* BOTTOM (RED) */}
            <div className="lcp-box lcp-box--low">
              {data.lowItems.map((r, i) => (
                <div key={i} className="lcp-row">
                  <div className="lcp-text">{r.text}</div>
                  <div className="lcp-score">{r.score}</div>
                </div>
              ))}
            </div>

            <div className="lcp-footnote-red">
              *Was part of the highest / lowest ratings last year as well
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lcp-side">
            <div className="lcp-side__header">LEADER PROFILE</div>

            <ul className="lcp-side__list">
              {data.profile.map((p, i) => <li key={i}>{p}</li>)}
            </ul>

            {/* this divider MUST align with midline */}
            <div className="lcp-side__midline" />

            <ul className="lcp-side__list">
              {data.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const LeaderComparisonPage = () => {
  const data = [
    {
      name: "Smt. Kanakalakshmi S",
      responses: 151,
      topItems: [
        { text: "Does not misuse power or authority", score: 4.58 },
        { text: "Visits classrooms & monitors quality", score: 4.5 },
        { text: "Provides enough support & guidance", score: 4.5 },
      ],
      lowItems: [
        { text: "Makes team members feel empowered", score: 4.26 },
        { text: "Leads without aggression", score: 4.27 },
        { text: "Values diverse perspectives", score: 4.34 },
        { text: "Has created work culture", score: 4.34 },
      ],
      profile: [
        "Strong leader with a clear vision",
        "Empathetic listener",
        "Manages tough situations well",
      ],
      notes: [
        "Needs to increase meetings with teachers",
        "Provide feedback in private",
        "Enhance teacher opportunities",
      ],
    },
    {
      name: "Smt. Nandhini S",
      responses: 96,
      topItems: [
        { text: "Provides support & guidance", score: 4.51 },
        { text: "Helps resolve issues", score: 4.42 },
        { text: "Maintains high academic standards", score: 4.41 },
      ],
      lowItems: [
        { text: "Leads without aggression", score: 4.01 },
        { text: "Builds rapport with team", score: 4.1 },
        { text: "Makes one feel valued", score: 4.2 },
      ],
      profile: [
        "Bold and confident leader",
        "Inspires team",
        "Balances expectations",
      ],
      notes: [
        "Needs to be calm in situations",
        "Ensure feedback is constructive",
        "Reduce waiting time",
      ],
    },
  ];

  const blocks = useMemo(() => {
    return [
      <div key="lcp" className="lcp-page">
        <FeedbackCommonHeader title="Leader Comparison" />

        <div className="lcp-grid">
          {data.map((d, i) => (
            <LeaderCard key={i} data={d} />
          ))}
        </div>
      </div>,
    ];
  }, []);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={1123}
      pagePadding={0}
      contentClassName="leader-comparison-page"
      componentId="leader-comparison"
    />
  );
};

export default LeaderComparisonPage;