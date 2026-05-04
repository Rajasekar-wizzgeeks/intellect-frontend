import "../styles/SurveySummaryRecap.scss";
import LeadhipforStaff from "../assets/png/leadershipForStaffPerformance.png"
import LeadhipPersonality from "../assets/png/leadershipPersonalityAndStyle.png"
import educationalQualityAndStudentOutcomes from "../assets/png/educationalQualityAndStudentOutcomes.png"
import creatingTheRightCulture from "../assets/png/creatingTheRightCulture.png"
import engagementAndManagement from "../assets/png/engagementAndManagement.png"
import noofPrinciplesAssesed from "../assets/png/NoofPrinciplesAssesed.png"
import responsesGivenBy from "../assets/png/responsesGivenBy.png"
import totalNoOfQuestions from "../assets/png/totalNoOfQuestions.png"
const competencies = [
  { title: "Leadership for\nStaff performance\n& Development", icon:LeadhipforStaff },
  { title: "Leadership\nPersonality &\nStyle", icon: LeadhipPersonality },
  { title: "Educational\nQuality & Student\noutcomes", icon: educationalQualityAndStudentOutcomes },
  { title: "Creating the right\nculture", icon: creatingTheRightCulture },
  { title: "Engagement with\nManagement", icon: engagementAndManagement },
];

const SurveySummaryRecap = () => {
  return (
    <div className="sfr-page">
      <div className="sfr">
        <h2 className="sfr__title">Survey Framework - Recap</h2>
        <div className="sfr__title-rule" />

        <div className="sfr__row">
          <img className="sfr__row-icon" aria-hidden src={noofPrinciplesAssesed}/>
          <span className="sfr__row-label">No of Principals Assessed</span>
          <span className="sfr__row-colon">:</span>
          <span className="sfr__row-value" />
        </div>
        <div className="sfr__divider" />

        <div className="sfr__row">
          <img className="sfr__row-icon" aria-hidden src={responsesGivenBy}/>
          <span className="sfr__row-label">Responses given by</span>
          <span className="sfr__row-colon">:</span>
          <span className="sfr__row-value sfr__row-value--red">
            Self, Managers &amp; Staff members (Teachers / Office staff)
          </span>
        </div>
        <div className="sfr__divider" />

        <div className="sfr__row">
          <img className="sfr__row-icon" aria-hidden src={totalNoOfQuestions}/>
          <span className="sfr__row-label">Total number of questions</span>
          <span className="sfr__row-colon">:</span>
          <span className="sfr__row-value sfr__row-value--red">
            29 (24 survey questions + 5 qualitative questions)
          </span>
        </div>
        <div className="sfr__divider" />

        <div className="sfr__bullet">
          <span className="sfr__triangle" />
          <span>The 24 survey questions were clustered into the following 5 competencies</span>
        </div>

        <div className="sfr__competencies">
          {competencies.map((c, i) => (
            <div key={i} className="sfr__comp">
              <div className="sfr__comp-circle">
                <img className="sfr__comp-icon" src={c.icon}/>
              </div>
              <div className="sfr__comp-title">
                {c.title.split("\n").map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sfr__bullet sfr__bullet--last">
          <span className="sfr__triangle" />
          <span>
            The 5 Qualitative comments questions were on{" "}
            <span className="sfr__red">
              “Leadership Style”, “Workplace culture”, “Leadership trait” and one thing the
              nominee should “continue doing” &amp; “stop doing”
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SurveySummaryRecap;
