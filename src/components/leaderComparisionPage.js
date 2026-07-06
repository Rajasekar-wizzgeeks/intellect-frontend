import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import "../styles/leaderComparisionPage.scss";

const LeaderPart = ({
  type, // "green" or "red"
  highest,
  lowest,
  profile,
  developmentAreas,
}) => {
  if (type === "green") {
    return (
      <div className="leader-green-row">
        <div className="leader-axis-col">
          <div className="leader-axis leader-axis--up">
            <span className="leader-axis-arrow" />
            <span className="leader-axis-line leader-axis-line--green" />
            <span className="leader-axis-label">
              <span className="leader-axis-label-inner">Highest Averages</span>
            </span>
            <span className="leader-axis-tick" />
          </div>
        </div>

        <div className="leader-ratings-col">
          <div className="leader-card leader-card--green">
            {highest.map((item, i) => (
              <div className="leader-row" key={`h-${i}`}>
                <div className="leader-row-text">{item.text}</div>
                <div className="leader-row-score">{item.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="leader-profile-col">
          <div className="leader-profile-header">LEADER PROFILE</div>
          <ul className="leader-profile-list">
            {(profile || []).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="leader-red-row">
      <div className="leader-axis-col">
        <div className="leader-axis leader-axis--down">
          <span className="leader-axis-tick" />
          <span className="leader-axis-label">
            <span className="leader-axis-label-inner">Lowest Averages</span>
          </span>
          <span className="leader-axis-line leader-axis-line--red" />
          <span className="leader-axis-arrow" />
        </div>
      </div>

      <div className="leader-ratings-col">
        <div className="leader-card leader-card--red">
          {lowest.map((item, i) => (
            <div className="leader-row" key={`l-${i}`}>
              <div className="leader-row-text">{item.text}</div>
              <div
                className={`leader-row-score ${
                  parseFloat(item.score) < 4 ? "leader-row-score--highlight" : ""
                }`}
              >
                {item.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="leader-profile-col">
        <ul className="leader-profile-list">
          {(developmentAreas || []).map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const LeaderHeader = ({ name, responses }) => (
  <div className="leader-col">
    <div className="leader-name-bar">{name}</div>
    <div className="leader-responses-bar">Team Responses # {responses}</div>
  </div>
);

const LeaderFootnote = ({ footnote }) => (
  <div className="leader-footnote">
    <div className="leader-footnote-legend">
      <em>*Was part of the highest / lowest ratings last year as well</em>
    </div>
    <ul className="leader-footnote-list">
      {footnote.map((f, i) => (
        <li key={i}>{f}</li>
      ))}
    </ul>
  </div>
);

export default function LeaderProfiles({ data }) {
  const leaders = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    return data.map(leader => ({
      name: leader.employee,
      responses: leader.team_responses,
      highest: (leader.highest_team_avg || []).map(q => ({ text: q.question, score: q.average.toFixed(2) })),
      lowest: (leader.lowest_team_avg || []).map(q => ({ text: q.question, score: q.average.toFixed(2) })),
      profile: (leader.leader_profiles?.highest_team_avg?.structured?.strengths || []),
      developmentAreas: (leader.leader_profiles?.lowest_team_avg?.structured?.strengths || []),
      footnote: []
    }));
  }, [data]);

  const blocks = useMemo(() => {
    const chunkedLeaders = [];
    for (let i = 0; i < leaders.length; i += 2) {
      chunkedLeaders.push(leaders.slice(i, i + 2));
    }

    const allBlocks = [];
    chunkedLeaders.forEach((pair, pairIdx) => {
      const left = pair[0];
      const right = pair[1] || { name: "", responses: 0, highest: [], lowest: [], profile: [], footnote: [] };

      allBlocks.push(
        <div key={`leader-pair-${pairIdx}`} className="leader-pair-wrapper">
          {/* Header Row */}
          <div className="leaders-global-row">
            <LeaderHeader {...left} />
            <LeaderHeader {...right} />
          </div>

          {/* GREEN BOX ROW */}
          <div className="leaders-global-row">
            <LeaderPart type="green" {...left} />
            <LeaderPart type="green" {...right} />
          </div>

          {/* GLOBAL ARROW DIVIDER */}
          <div className="leaders-global-divider">
            <span className="leaders-global-divider-seg leaders-global-divider-seg--left" />
            <span className="leaders-global-divider-seg leaders-global-divider-seg--right" />
          </div>

          {/* RED BOX ROW */}
          <div className="leaders-global-row">
            <LeaderPart type="red" {...left} />
            <LeaderPart type="red" {...right} />
          </div>

          {/* Footnote Row */}
          <div className="leaders-global-row" style={{ marginTop: "16px" }}>
            <LeaderFootnote {...left} />
            <LeaderFootnote {...right} />
          </div>
        </div>
      );

      if (pairIdx < chunkedLeaders.length - 1) {
        allBlocks.push(<div key={`spacer-${pairIdx}`} style={{ height: "40px" }} />);
      }
    });

    return allBlocks;
  }, [leaders]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="leaders"
      pageClassName="dav360-page"
      componentId="leaders-comparison"
    />
  );
}
