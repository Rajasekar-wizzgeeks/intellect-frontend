import "../styles/leaderComparisionPage.scss";
const LeaderPart = ({
  type, // "green" or "red"
  highest,
  lowest,
  profile,
}) => {
  if (type === "green") {
    return (
      <div className="leader-green-row">
        <div className="leader-axis-col">
          <div className="leader-axis leader-axis--up">
            <span className="leader-axis-arrow" />
            <span className="leader-axis-line leader-axis-line--green" />
            <span className="leader-axis-label">Highest Averages</span>
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
            {profile.slice(0, 3).map((p, i) => (
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
          <span className="leader-axis-label">Lowest Averages</span>
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
          {profile.slice(3).map((p, i) => (
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

export default function LeaderProfiles() {
  const left = {
    name: "Smt. Kanakalakshmi S",
    responses: 151,
    highest: [
      { text: "*Does not misuse his/her power or authority in any direct or indirect ways", score: "4.58" },
      { text: "*Visits classrooms to observe and monitor the quality of curriculum, assessments and instruction that engage students in successful learning", score: "4.5" },
      { text: "*Provides enough support, direction and guidance, for effective performance of team members", score: "4.5" },
    ],
    lowest: [
      { text: "Makes the team members feel empowered to take decisions", score: "4.26" },
      { text: "Leads without aggression or arrogance", score: "4.27" },
      { text: "*Values diverse perspectives, even if they are different from his/her own", score: "4.34" },
      { text: "*Has created a work culture that rewards merit", score: "4.34" },
    ],
    profile: [
      "Strong leader with a clear vision for the school",
      "Empathetic listener",
      "Manages tough or ambiguous situations well",
      "Needs to increase meetings with teachers",
      "Needs to provide feedback in a private & constructive manner",
      "Needs to enhance opportunities for teachers' professional growth",
      "To ensure broader allocation of work among teachers",
    ],
    footnote: [
      "No significant change noticed in any of the above areas as compared to last year",
    ],
  };

  const right = {
    name: "Smt. Nandhini S",
    responses: 96,
    highest: [
      { text: "Provides enough support, direction and guidance, for effective performance of team members", score: "4.51" },
      { text: "Helps in resolving issues/remove roadblocks in the job", score: "4.42" },
      { text: "*Works with teachers to set high academic standards that rise above minimum expectations", score: "4.41" },
    ],
    lowest: [
      { text: "*Leads without aggression or arrogance", score: "4.01" },
      { text: "Builds rapport with people and treats team members with respect and dignity", score: "4.1" },
      { text: "*Makes one feel valued as an individual", score: "4.2" },
    ],
    profile: [
      "Bold, confident and decisive leader with practical problem-solving abilities",
      "Inspires and motivates team",
      "Balances high expectations with encouragement",
      "Needs to be calm & composed in all situations",
      "Needs to ensure feedback is provided in a constructive manner",
      "Needs to minimize waiting time for staff members to meet her",
    ],
    footnote: [
      "No significant change noticed in any of the above areas as compared to last year except, \"Builds rapport with people\" which has come down by 0.25",
    ],
  };

  return (
    <div className="leaders">
      {/* Header Row */}
      <div className="leaders-global-row">
        <LeaderHeader {...left} />
        <LeaderHeader {...right} />
      </div>

      <div className="leader-body">
        {/* GREEN BOX ROW - Shared across both leaders */}
        <div className="leaders-global-row">
          <LeaderPart type="green" {...left} />
          <LeaderPart type="green" {...right} />
        </div>

        {/* GLOBAL ARROW DIVIDER */}
        <div className="leaders-global-divider">
          <span className="leaders-global-divider-seg leaders-global-divider-seg--left" />
          <span className="leaders-global-divider-seg leaders-global-divider-seg--right" />
        </div>

        {/* RED BOX ROW - Shared across both leaders */}
        <div className="leaders-global-row">
          <LeaderPart type="red" {...left} />
          <LeaderPart type="red" {...right} />
        </div>
      </div>

      {/* Footnote Row */}
      <div className="leaders-global-row" style={{ marginTop: "16px" }}>
        <LeaderFootnote {...left} />
        <LeaderFootnote {...right} />
      </div>

      <div className="leaders-page-number">8</div>
    </div>
  );
}
