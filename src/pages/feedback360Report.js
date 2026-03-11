import React, { useEffect, useState, useRef } from "react";
import FeedbackInitialPage from "../components/feedbackInitialPage";
import SurveyFeedback from "../components/surveyFeedback";
import "../styles/feedback360Report.scss";
import SuggestedGuidelines from "../components/suggestedGuidelines";
import StrengthsPage from "../components/StrengthsPage";
import SummaryByCompetencyPage from "../components/SummaryByCompetencyPage";
import StaffPerformanceSummaryByCompetencyPage from "../components/StaffPerformanceSummaryByCompetencyPage";
import EngagementWithManagementSummaryByCompetencyPage from "../components/EngagementWithManagementSummaryByCompetencyPage";
import NomineesLeadershipStylePage from "../components/NomineesLeadershipStylePage";
import QualitativeFeedbackCoverPage from "../components/QualitativeFeedbackCoverPage";
import ContinueDoingPage from "../components/ContinueDoingPage";
import StopDoingPage from "../components/StopDoingPage";
import GlobalLoader from "../components/globalLoader";
import { downloadPdfSplitByHeader } from "../utils/pdf";
import { excelSheetFeedback } from "../helper/apicalls/feedback";
import { useOutletContext } from "react-router-dom";

const Feedback360Report = () => {
  const [feedbackOverallData, setFeedbackOverallData] = useState(null);
  const { setIsHeader, setHeaderName } = useOutletContext();
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [averageCompentency, setAverageCompentency] = useState({});

  const buildCompetencyItemsFromApi = (summary) => {
    if (!summary) return [];
    return [
      {
        label: "Leadership Personality & Style",
        groupMean: summary.leadership_style?.Subordinates ?? null,
        managerRating: summary.leadership_style?.Manager ?? null,
        selfRating: summary.leadership_style?.Self ?? null,
      },
      {
        label: "Educational Quality & Student Outcomes",
        groupMean: summary.educational_quality?.Subordinates ?? null,
        managerRating: null,
        selfRating: summary.educational_quality?.Self ?? null,
      },
      {
        label: "Leadership for Staff Performance & Development",
        groupMean: summary.leadership_staff_dev?.Subordinates ?? null,
        managerRating: null,
        selfRating: summary.leadership_staff_dev?.Self ?? null,
      },
      {
        label: "Creating the Right Culture",
        groupMean: summary.right_culture?.Subordinates ?? null,
        managerRating: summary.right_culture?.Manager ?? null,
        selfRating: summary.right_culture?.Self ?? null,
      },
      {
        label: "Engagement with Management",
        groupMean: summary.engagement_with_management?.Subordinates ?? null,
        managerRating: summary.engagement_with_management?.Manager ?? null,
        selfRating: summary.engagement_with_management?.Self ?? null,
      },
    ];
  };

  const buildThreeTextColumns = (items) => {
    if (!Array.isArray(items) || !items.length) return [];
    const cleaned = items
      .map((raw) =>
        String(raw || "")
          .replace(/_x000D_\s*/gi, " ")
          .trim(),
      )
      .filter((t) => t && t !== "-" && t !== "--" && t !== "---");

    if (!cleaned.length) return [];

    const cols = [[], [], []];

    const rowsPerCol = Math.ceil(cleaned.length / 3);

    cleaned.forEach((text, idx) => {
      const colIdx = Math.min(2, Math.floor(idx / rowsPerCol));
      cols[colIdx].push(text);
    });
    return cols;
  };

  const buildDynamicStopDoingColumns = (items) => {
    if (!Array.isArray(items) || !items.length) return [];
    const cleaned = items
      .map((raw) =>
        String(raw || "")
          .replace(/_x000D_\s*/gi, " ")
          .trim(),
      )
      .filter((t) => t && t !== "-" && t !== "--" && t !== "---");
    if (!cleaned.length) return [];
    const columnCount = cleaned.length > 300 ? 3 : 2;
    const cols = Array.from({ length: columnCount }, () => []);

    const rowsPerCol = Math.ceil(cleaned.length / columnCount);

    cleaned.forEach((text, idx) => {
      const colIdx = Math.min(columnCount - 1, Math.floor(idx / rowsPerCol));
      cols[colIdx].push(text);
    });

    return cols;
  };

  const computeOverallFromApi = (summary) => {
    if (!summary) return 4.15;
    const values = [
      summary.leadership_style?.Subordinates,
      summary.educational_quality?.Subordinates,
      summary.leadership_staff_dev?.Subordinates,
      summary.right_culture?.Subordinates,
    ].filter((v) => typeof v === "number");
    if (!values.length) return 4.15;
    const total = values.reduce((acc, v) => acc + v, 0);
    return Number((total / values.length).toFixed(2));
  };

  const computeOverallScore = (d) => {
    let total = 0;
    let total_no_of_count = 0;
    if (Object.entries(d).length === 0) {
      return 0;
    }
    Object.entries(d).map(([key, value]) => {
      Object.entries(value).map(([subKey, subValue]) => {
        if (subKey !== "Self") {
          total += subValue;
          total_no_of_count += 1;
        }
      });
    });
    return Number((total / total_no_of_count).toFixed(2));
  };

  const buildThreeWayCompetencyItems = (obj, fallbackItems) => {
    if (!obj) return fallbackItems;
    const rows = Object.entries(obj).map(([label, vals]) => ({
      label,
      groupMean: vals?.Subordinates === null ? -1 : vals?.Subordinates,
      managerRating: vals?.Manager === null ? -1 : vals?.Manager,
      selfRating: vals?.Self === null ? -1 : vals?.Self,
    }));

    // rows.sort((a, b) => {
    //   const av = Number(a?.groupMean);
    //   const bv = Number(b?.groupMean);

    //   const aValid = Number.isFinite(av) && av !== -1;
    //   const bValid = Number.isFinite(bv) && bv !== -1;

    //   if (aValid && bValid) return bv - av;
    //   if (aValid && !bValid) return -1;
    //   if (!aValid && bValid) return 1;
    //   return 0;
    // });

    return rows;
  };

  const competencyBiggerPictureItems = buildCompetencyItemsFromApi(
    feedbackOverallData?.competency_summary_overall || {},
  );

  const competencyBiggerPictureOverallScore = computeOverallFromApi(
    feedbackOverallData?.competency_summary_overall,
  );

  const summaryByCompetencyItems = buildThreeWayCompetencyItems(
    feedbackOverallData?.right_culture_competency,
    [
      {
        label: "Generates energy and enthusiasm in\nthe team",
        groupMean: 4.67,
        managerRating: 3,
        selfRating: 5,
      },
      {
        label: "Has created a high performing culture\nin the team/school",
        groupMean: 4.53,
        managerRating: 3,
        selfRating: 4,
      },
      {
        label: "Has created a work culture that\nrewards merit",
        groupMean: 4.49,
        managerRating: 4,
        selfRating: 4,
      },
    ],
  );

  const summaryByCompetencyLeadershipItems = buildThreeWayCompetencyItems(
    feedbackOverallData?.leadership_style_competency,
    [
      {
        label:
          "Builds rapport with people and treats team members\nwith respect and dignity",
        groupMean: 4.91,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label: "Leads without aggression or arrogance",
        groupMean: 4.91,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label:
          "Does not misuse his/her power or authority in any direct\nor indirect ways",
        groupMean: 4.86,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label: "Makes one feel valued as an individual",
        groupMean: 4.77,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label: "Handles ambiguous situations well",
        groupMean: 4.65,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label:
          "Values diverse perspectives, even if they are different\nfrom his/her own",
        groupMean: 4.58,
        managerRating: 4,
        selfRating: 5,
      },
      {
        label:
          "Usually makes the right decisions promptly and on time\nwithout undue delay",
        groupMean: 4.35,
        managerRating: 3,
        selfRating: 5,
      },
    ],
  );
  const staffPerformanceCompetencyItems = buildThreeWayCompetencyItems(
    feedbackOverallData?.leadership_staff_dev_competency,
    [
      {
        label:
          "Provides opportunities for career/professional development\nand growth",
        groupMean: 4.74,
        selfRating: 5,
      },
      {
        label:
          "Provides enough support, direction and guidance whenever\nrequired, for effective performance of team members",
        groupMean: 4.72,
        selfRating: 5,
      },
      {
        label: "Helps in resolving issues/remove roadblocks in the job",
        groupMean: 4.7,
        selfRating: 5,
      },
      {
        label: "Makes the team members feel empowered to take decisions",
        groupMean: 4.63,
        selfRating: 5,
      },
      {
        label: "Delegates effectively",
        groupMean: 4.53,
        selfRating: 5,
      },
      {
        label:
          "Gives clear feedback about performance or when anything\ngoes right or wrong",
        groupMean: 4.49,
        selfRating: 5,
      },
    ],
  );
  const engagementWithManagementItems = buildThreeWayCompetencyItems(
    feedbackOverallData?.engagement_with_management_competency,
    [
      {
        label:
          "Manages school finances and payment approvals\nappropriately and maintains clear & accurate accounts",
        managerRating: 5,
        selfRating: 5,
      },
      {
        label:
          "Raises relevant issues at the right time and in the right\nway to the Management on topics of importance to the\nschool",
        managerRating: 4,
        selfRating: 5,
      },
      {
        label: "Develops future leaders within the school",
        managerRating: 3,
        selfRating: 5,
      },
    ],
  );

  const educationalQualityCompetencyItems = buildThreeWayCompetencyItems(
    feedbackOverallData?.educational_quality_competency,
    [
      {
        label:
          "Works with teachers to set high academic standards\nthat rise above minimum expectations",
        groupMean: 4.7,
        selfRating: 5,
      },
      {
        label:
          "Visits classrooms to observe and monitor the quality of\ncurriculum, assessments and instruction that engage\nstudents in successful learning",
        groupMean: 4.68,
        selfRating: 4,
      },
      {
        label:
          "Ensures that teachers have appropriate resources to\nmeet the needs of each student",
        groupMean: 4.63,
        selfRating: 5,
      },
      {
        label:
          "Facilitates opportunities for teachers to transfer and\nmentor other teachers on best practices",
        groupMean: 4.63,
        selfRating: 4,
      },
      {
        label:
          "Builds a passion and sense of urgency amongst staff\nmembers for them to make continuous improvements\nto the quality of learning for every student",
        groupMean: 4.55,
        selfRating: 5,
      },
    ],
  );
  

  useEffect(() => {
    if (!feedbackOverallData) return;

    setAverageCompentency({
      right_culture_competency: summaryByCompetencyItems,
      leadership_style_competency: summaryByCompetencyLeadershipItems,
      leadership_staff_dev_competency: staffPerformanceCompetencyItems,
      educational_quality_competency: educationalQualityCompetencyItems,
      engagement_with_management_competency: engagementWithManagementItems,
    });
  }, [feedbackOverallData]);

  const biggerPictureItems = competencyBiggerPictureItems.length
    ? competencyBiggerPictureItems
    : [];

  const strengthsGroupItems = feedbackOverallData?.strengths
    ? (feedbackOverallData.strengths.Subordinates || []).map((item) => ({
        score: item.score,
        text: item.question,
      }))
    : [
        {
          score: 4.91,
          text: "Builds rapport with people and treats them with respect and dignity",
        },
        {
          score: 4.91,
          text: "Leads without aggression or arrogance",
        },
        {
          score: 4.86,
          text: "Builds rapport with people and treats them with respect and dignity",
        },
      ];

  const strengthsManagerItems = feedbackOverallData?.strengths
    ? (feedbackOverallData.strengths.Manager || []).map((item) => ({
        score: item.score,
        text: item.question,
      }))
    : [
        {
          score: 5.0,
          text: "Manages school finances and payment approvals appropriately and maintains clear and accurate accounts",
        },
        {
          score: 5.0,
          text: "Manages school finances and payment approvals appropriately and maintains clear and accurate accounts",
        },
      ];

  const improvementsGroupItems = feedbackOverallData?.area_of_improvement
    ? (feedbackOverallData.area_of_improvement.Subordinates || []).map(
        (item) => ({
          score: item.score,
          text: item.question,
        }),
      )
    : [];

  const improvementsManagerItems = feedbackOverallData?.area_of_improvement
    ? (feedbackOverallData.area_of_improvement.Manager || []).map((item) => ({
        score: item.score,
        text: item.question,
      }))
    : [];

  const buildNomineeLeadershipItems = (nomineeObj) => {
    if (!nomineeObj) {
      return [];
    }

    const entries = Object.entries(nomineeObj);
    if (!entries.length) return [];
    const total = entries.reduce((sum, [, v]) => sum + (v?.count || 0), 0) || 1;
    const palette = {
      A: {
        color: "#20c6a2",
        pillColor: "#20c6a2",
        cardColor:"#067a61"
      },
      B: {
        color: "#3a9ad9",
        pillColor: "#3a9ad9",
        cardColor:"#13679e"
      },
      C: {
        color: "#ef4b3a",
        pillColor: "#ef4b3a",
        cardColor:"#e82315"
      },
    };
    const orderedKeys = ["A", "B", "C"];
    return orderedKeys
      .filter((key) => nomineeObj[key])
      .map((key) => {
        const { text, count } = nomineeObj[key];
        const pct = (count / total) * 100;

        const base =
          key === "C"
            ? "Good blend of task and relationship"
            : key === "A"
              ? "Too task focused and less relationship oriented"
              : "Too relationship oriented and less task oriented";

        const labelText = text || base;

        const style = palette[key] || palette.C;
        return {
          percent: Math.round(pct),
          color: style.color,
          pillText: `${labelText} – ${count} respondent${count === 1 ? "" : "s"}`,
          pillColor: style.pillColor,
          cardColor: style.cardColor,
        };
      });
  };

  const nomineeLeadershipItems = buildNomineeLeadershipItems(
    feedbackOverallData?.nominee_leadership,
  );


  const immediateActionAreasSummary = {
    title: "Immediate Action Areas - Summary",
    description:
      "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
    note: "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
    columns: feedbackOverallData?.action_areas_thing || {
      continue: [],
      start: [],
      stop: [],
    },
  };

  const handleExcelChange = (e) => {
    const file = e.target.files?.[0] || null;
    setExcelFile(file);
    if (file) {
      handleExcelUpload(file);
      e.target.value = "";
    }
  };

  // console.log("feedbackOverallData", feedbackOverallData);

  const handleExcelUpload = async (fileArg) => {
    setAverageCompentency({});
    setFeedbackOverallData({});
    const fileToUpload = fileArg || excelFile;
    if (!fileToUpload || isUploading) return;
    try {
      setIsUploading(true);
      const response = await excelSheetFeedback(fileToUpload);
      setFeedbackOverallData(response);
    } catch (err) {
      console.error("Excel upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setHeaderName("Feedback");
  }, []);
  return (
    <div className="feedbackreport-main-container">
      <GlobalLoader visible={isUploading} />
      <div className="feedbackreport-toolbar">
        <button
          onClick={downloadPdfSplitByHeader}
          className="feedbackreport-btn feedbackreport-btn--download"
        >
          Download PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleExcelChange}
          className="feedbackreport-file-input"
          // disabled={!isUploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={`feedbackreport-btn feedbackreport-btn--upload${
            isUploading ? " feedbackreport-btn--upload-disabled" : ""
          }`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Excel"}
        </button>
      </div>
      <div className="section-page pdf-section">
        <FeedbackInitialPage
          initialName={
            feedbackOverallData?.name ? feedbackOverallData?.name : ""
          }
        />
      </div>
      <SurveyFeedback overviewData={feedbackOverallData} />

      <SuggestedGuidelines
        items={biggerPictureItems}
        overallScore={competencyBiggerPictureOverallScore}
        averageCompentency={averageCompentency}
      />

      <StrengthsPage
        startPage={6}
        groupItems={strengthsGroupItems}
        averageCompentency={averageCompentency}
        managerItems={strengthsManagerItems}
        improvementsGroupItems={improvementsGroupItems}
        improvementsManagerItems={improvementsManagerItems}
      />

      <SummaryByCompetencyPage
        title="Summary by Competency – Creating the Right Culture"
        overallScore={computeOverallScore(
          feedbackOverallData?.right_culture_competency || {},
        )}
        items={summaryByCompetencyItems}
        leadershipOverallScore={computeOverallScore(
          feedbackOverallData?.leadership_style_competency || {},
        )}
        leadershipItems={summaryByCompetencyLeadershipItems}
        barHeight={12}
        setAverageCompentency={setAverageCompentency}
      />

      <StaffPerformanceSummaryByCompetencyPage
        overallScore={computeOverallScore(
          feedbackOverallData?.leadership_staff_dev_competency || {},
        )}
        items={staffPerformanceCompetencyItems}
        title2="Summary by Competency – Educational Quality & Student Outcomes"
        overallScore2={computeOverallScore(
          feedbackOverallData?.educational_quality_competency || {},
        )}
        items2={educationalQualityCompetencyItems}
        barHeight={6}
        setAverageCompentency={setAverageCompentency}
      />

      <EngagementWithManagementSummaryByCompetencyPage
        overallScore={computeOverallScore(
          feedbackOverallData?.engagement_with_management_competency || {},
        )}
        items={engagementWithManagementItems}
        setAverageCompentency={setAverageCompentency}
      />

      <div className="section-page pdf-section">
        <QualitativeFeedbackCoverPage />
      </div>
      <NomineesLeadershipStylePage
        items={nomineeLeadershipItems}
        adjectives={
          feedbackOverallData?.workplace_culture
            ? feedbackOverallData?.workplace_culture
            : []
        }
      />
      <ContinueDoingPage
        columns={
          buildThreeTextColumns(feedbackOverallData?.continue_doing_thing) || []
        }
      />
      <StopDoingPage
        columns={
          buildDynamicStopDoingColumns(feedbackOverallData?.stop_doing_thing) ||
          []
        }
        traits={
          feedbackOverallData?.predominant_leader_most_thing
            ? feedbackOverallData?.predominant_leader_most_thing
            : []
        }
      />
      <ContinueDoingPage
        title="Most Predominant Leadership Trait"
        columns={
          buildThreeTextColumns(
            feedbackOverallData?.predominant_leader_thing,
          ) 
        }
      />
      <ContinueDoingPage
        title={"Immediate Action Areas - Summary"}
        columns={[[], [], []]}
        footnote={""}
        immediateActionSummary={immediateActionAreasSummary}
      />
    </div>
  );
};

export default Feedback360Report;
