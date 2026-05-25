import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
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
import ShareModal from "../components/ShareModal";
import StatusModal from "../components/StatusModal";
import { downloadPdfSplitByHeader } from "../utils/pdf";
import { excelSheetFeedback, saveDraft, getOneFeedbackDraft, updateFeedbackDraft } from "../helper/apicalls/feedback";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from "lucide-react";

const setEditsIfChanged = (setter, data) => {
  setter((prev) => {
    if (prev === data) return prev;
    try {
      if (prev && JSON.stringify(prev) === JSON.stringify(data)) return prev;
    } catch {
      // ignore comparison errors
    }
    return data;
  });
};

const Feedback360Report = () => {
  const [feedbackOverallData, setFeedbackOverallData] = useState(null);
  const { setHeaderName } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft_id");
  const [showComparisonTable, setShowComparisonTable] = useState(true);
  const currentYearFileInputRef = useRef(null);
  const previousYearFileInputRef = useRef(null);
  const previousSecondYearFileInputRef = useRef(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentYearExcelFile, setCurrentYearExcelFile] = useState(null);
  const [previousYearExcelFile, setPreviousYearExcelFile] = useState(null);
  const [previousSecondYearExcelFile, setPreviousSecondYearExcelFile] =
    useState(null);
  const [uploadError, setUploadError] = useState("");
  const [averageCompentency, setAverageCompentency] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [strengthsEdits, setStrengthsEdits] = useState(null);
  const [initialPageEdits, setInitialPageEdits] = useState(null);
  const [surveyFeedbackEdits, setSurveyFeedbackEdits] = useState(null);
  const [continueDoingEdits, setContinueDoingEdits] = useState(null);
  const [stopDoingEdits, setStopDoingEdits] = useState(null);
  const [predominantLeaderEdits, setPredominantLeaderEdits] = useState(null);
  const [immediateActionEdits, setImmediateActionEdits] = useState(null);
  const [nomineeEdits, setNomineeEdits] = useState(null);
  const [engagementEdits, setEngagementEdits] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "", title: "" });

  const currentYearLabel = new Date().getFullYear();
  const previousYearLabel = currentYearLabel - 1;
  const previousSecondYearLabel = currentYearLabel - 2;

  const yearOptions = useMemo(() => {
    const out = [];
    for (let y = currentYearLabel; y >= currentYearLabel - 10; y -= 1) {
      out.push(y);
    }
    return out;
  }, [currentYearLabel]);

  const [file2Year, setFile2Year] = useState(previousYearLabel);
  const [file3Year, setFile3Year] = useState(previousSecondYearLabel);

  const acceptFile = (file) => {
    if (!file) return false;
    const name = String(file.name || "").toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");
  };

  const handleDrop = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
    const file = e.dataTransfer?.files?.[0] || null;
    if (!acceptFile(file)) return;

    if (key === "file1") {
      setCurrentYearExcelFile(file);
      setUploadError("");
    } else if (key === "file2") {
      setPreviousYearExcelFile(file);
    } else if (key === "file3") {
      setPreviousSecondYearExcelFile(file);
    }
  };

  const handleDragOver = (key, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(key);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
  };

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

    const normalizeQualitativeText = (raw) => {
      const display = String(raw || "").replace(/_x000D_\s*/gi, " ").trim();
      const plain = display
        .replace(/&nbsp;?/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { display, plain };
    };

    const cleaned = items
      .map((raw) => normalizeQualitativeText(raw))
      .filter(
        ({ plain }) =>
          plain && !/^[-–—]{2,}$/.test(plain),
      )
      .map(({ display }) => display);

    if (!cleaned.length) return [];

    const cols = [[], [], []];

    const rowsPerCol = Math.ceil(cleaned.length / 3);

    cleaned.forEach((text, idx) => {
      const colIdx = Math.min(2, Math.floor(idx / rowsPerCol));
      cols[colIdx].push(text);
    });
    return cols;
  };

  const buildThreeGroupColumns = (groups) => {
    if (!Array.isArray(groups) || !groups.length) {
      return { columns: [], indexMatrix: [] };
    }

    const hasGroupShape = groups.some(
      (g) =>
        g &&
        typeof g === "object" &&
        ("comments_belong_to_this_group" in g ||
          "representative_comment" in g ||
          "representativeComment" in g),
    );

    if (!hasGroupShape) {
      return { columns: buildThreeTextColumns(groups), indexMatrix: [] };
    }

    const cleaned = [];
    groups.forEach((g, idx) => {
      const representative =
        (g &&
          typeof g === "object" &&
          (g.representative_comment ??
            g.representativeComment ??
            g.comment ??
            g.text)) ||
        "";

      const t = String(representative).replace(/_x000D_\s*/gi, " ").trim();
      const plain = t
        .replace(/&nbsp;?/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!plain || /^[-–—]{2,}$/.test(plain)) return;
      cleaned.push({ text: t, idx });
    });

    if (!cleaned.length) return { columns: [], indexMatrix: [] };

    const columns = [[], [], []];
    const indexMatrix = [[], [], []];
    const rowsPerCol = Math.ceil(cleaned.length / 3);

    cleaned.forEach((row, pos) => {
      const colIdx = Math.min(2, Math.floor(pos / rowsPerCol));
      columns[colIdx].push(row.text);
      indexMatrix[colIdx].push(row.idx);
    });

    return { columns, indexMatrix };
  };

  const buildDynamicStopDoingColumns = (items) => {
    if (!Array.isArray(items) || !items.length) return [];
    const cleaned = items
      .map((raw) => String(raw || "").replace(/_x000D_\s*/gi, " ").trim())
      .filter((t) => {
        const plain = String(t)
          .replace(/&nbsp;?/gi, " ")
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return plain && !/^[-–—]{2,}$/.test(plain);
      });
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
    if (!d || Object.entries(d).length === 0) return 0;

    const totalResponse = feedbackOverallData?.total_response || {
      total: 1,
      Self: 0,
      Manager: 0,
      Subordinates: 0,
    };

    const subCount = Number(totalResponse.Subordinates) || 0;
    const mgrCount = Number(totalResponse.Manager) || 0;
    
    let totalSubScore = 0;
    let totalMgrScore = 0;
    let subQuestionsCount = 0;
    let mgrQuestionsCount = 0;

    Object.values(d).forEach((vals) => {
      if (vals.Subordinates !== undefined && vals.Subordinates !== null) {
        totalSubScore += vals.Subordinates;
        subQuestionsCount += 1;
      }
      if (vals.Manager !== undefined && vals.Manager !== null) {
        totalMgrScore += vals.Manager;
        mgrQuestionsCount += 1;
      }
    });

    const avgSub = subQuestionsCount > 0 ? totalSubScore / subQuestionsCount : 0;
    const avgMgr = mgrQuestionsCount > 0 ? totalMgrScore / mgrQuestionsCount : 0;

    // Adjusted totalMinusSelf based on available data in 'd'
    let effectiveTotalCount = 0;
    if (subQuestionsCount > 0) effectiveTotalCount += subCount;
    if (mgrQuestionsCount > 0) effectiveTotalCount += mgrCount;

    if (effectiveTotalCount <= 0) return 0;

    // Formula: (Avg Subordinates * total_response.Subordinates) + (avg manger * total_response.Manager) / (effective total count)
    const weightedScore = (avgSub * subCount + avgMgr * mgrCount) / effectiveTotalCount;

    return Number(weightedScore.toFixed(2));
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

  const strengthsGroupItems = (feedbackOverallData?.strengths?.Subordinates || [])
    .filter((item) => item?.question)
    .map((item) => ({
      score: item.score,
      text: item.question,
    }));

  const strengthsManagerItems = (feedbackOverallData?.strengths?.Manager || [])
    .filter((item) => item?.question)
    .map((item) => ({
      score: item.score,
      text: item.question,
    }));

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
        cardColor: "#067a61",
      },
      B: {
        color: "#3a9ad9",
        pillColor: "#3a9ad9",
        cardColor: "#13679e",
      },
      C: {
        color: "#ef4b3a",
        pillColor: "#ef4b3a",
        cardColor: "#e82315",
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

  const immediateActionAreasSummary = useMemo(
    () => ({
      title: "Immediate Action Areas - Summary",
      description:
        "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
      note: "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
      columns: feedbackOverallData?.action_areas_thing || {
        continue: [],
        start: [],
        stop: [],
      },
    }),
    [feedbackOverallData?.action_areas_thing],
  );

  const continueDoingPageProps = useMemo(() => {
    const groups = Array.isArray(feedbackOverallData?.continue_doing_thing)
      ? feedbackOverallData.continue_doing_thing
      : [];
    const built = buildThreeGroupColumns(groups);
    return {
      columns: built.columns || [],
      groups,
      groupIndexMatrix: built.indexMatrix || [],
    };
  }, [feedbackOverallData?.continue_doing_thing]);

  const stopDoingPageProps = useMemo(() => {
    const groups = Array.isArray(feedbackOverallData?.stop_doing_thing)
      ? feedbackOverallData.stop_doing_thing
      : [];
    const built = buildThreeGroupColumns(groups);
    return {
      columns: built.columns || [],
      groups,
      groupIndexMatrix: built.indexMatrix || [],
    };
  }, [feedbackOverallData?.stop_doing_thing]);

  const predominantLeaderPageProps = useMemo(() => {
    const raw = Array.isArray(feedbackOverallData?.predominant_leader_thing)
      ? feedbackOverallData.predominant_leader_thing
      : [];

    const hasGroupShape = raw.some(
      (g) =>
        g &&
        typeof g === "object" &&
        ("comments_belong_to_this_group" in g ||
          "representative_comment" in g),
    );

    if (!hasGroupShape) {
      return {
        columns: buildThreeTextColumns(raw),
      };
    }

    const cleaned = [];
    raw.forEach((g, idx) => {
      const representative =
        (g &&
          typeof g === "object" &&
          (g.representative_comment ??
            g.representativeComment ??
            g.comment ??
            g.text)) ||
        "";
      const t = String(representative).replace(/_x000D_\s*/gi, " ").trim();
      const plain = t
        .replace(/&nbsp;?/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!plain || /^[-–—]{2,}$/.test(plain)) return;
      cleaned.push({ text: t, idx });
    });

    if (!cleaned.length) {
      return {
        columns: buildThreeTextColumns([]),
      };
    }

    const columns = [[], [], []];
    const indexMatrix = [[], [], []];
    const rowsPerCol = Math.ceil(cleaned.length / 3);

    cleaned.forEach((row, pos) => {
      const colIdx = Math.min(2, Math.floor(pos / rowsPerCol));
      columns[colIdx].push(row.text);
      indexMatrix[colIdx].push(row.idx);
    });

    return {
      continue: true,
      columns,
      groups: raw,
      groupIndexMatrix: indexMatrix,
    };
  }, [feedbackOverallData?.predominant_leader_thing]);

  const continueDoingFootnote = useMemo(
    () => (
      <>
        <div>
          *Similar comments with slight variations in wording will be grouped
          together for ease of reading and arranged in decreasing order of
          frequency
        </div>
        <div>*This excludes self feedback</div>
      </>
    ),
    [],
  );

  const predominantLeaderFootnote = useMemo(
    () => (
      <>
        <div>
          *Similar comments with slight variations in wording will be grouped
          together for ease of reading and arranged in decreasing order of
          frequency
        </div>
        <div>*This excludes self feedback</div>
      </>
    ),
    [],
  );

  const handleInitialPageChange = useCallback(
    (data) => setEditsIfChanged(setInitialPageEdits, data),
    [],
  );
  const handleSurveyFeedbackChange = useCallback(
    (data) => setEditsIfChanged(setSurveyFeedbackEdits, data),
    [],
  );
  const handleStrengthsChange = useCallback(
    (data) => setEditsIfChanged(setStrengthsEdits, data),
    [],
  );
  const handleCompetencyDataChange = useCallback((patch) => {
    setAverageCompentency((prev) => {
      const next = { ...(prev || {}), ...patch };
      try {
        if (prev && JSON.stringify(prev) === JSON.stringify(next)) return prev;
      } catch {
        // ignore comparison errors
      }
      return next;
    });
  }, []);
  const handleEngagementDataChange = useCallback((patch) => {
    setEngagementEdits((prev) => {
      const next = { ...(prev || {}), ...patch };
      try {
        if (prev && JSON.stringify(prev) === JSON.stringify(next)) return prev;
      } catch {
        // ignore comparison errors
      }
      return next;
    });
    if (patch.engagement_with_management_competency) {
      handleCompetencyDataChange({
        engagement_with_management_competency:
          patch.engagement_with_management_competency,
      });
    }
  }, [handleCompetencyDataChange]);
  const handleContinueDoingChange = useCallback(
    (data) => setEditsIfChanged(setContinueDoingEdits, data),
    [],
  );
  const handleStopDoingChange = useCallback(
    (data) => setEditsIfChanged(setStopDoingEdits, data),
    [],
  );
  const handlePredominantLeaderChange = useCallback(
    (data) => setEditsIfChanged(setPredominantLeaderEdits, data),
    [],
  );
  const handleImmediateActionChange = useCallback(
    (data) => setEditsIfChanged(setImmediateActionEdits, data),
    [],
  );
  const handleNomineeChange = useCallback(
    (data) => setEditsIfChanged(setNomineeEdits, data),
    [],
  );

  // console.log("feedbackOverallData", averageCompentency);

  const openUploadModal = () => {
    if (isUploading) return;
    setUploadError("");
    setFile2Year(previousYearLabel);
    setFile3Year(previousSecondYearLabel);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    if (isUploading) return;
    setIsUploadModalOpen(false);
  };

  const handleThreeFileUpload = async () => {
    if (isUploading) return;

    if (!currentYearExcelFile) {
      setUploadError("Current Year file is required.");
      return;
    }

    try {
      setUploadError("");
      setIsUploading(true);
      const response = await excelSheetFeedback([
        currentYearExcelFile,
        previousYearExcelFile,
        previousSecondYearExcelFile,
      ]);
      setFeedbackOverallData(response);
      setIsUploadModalOpen(false);
      setCurrentYearExcelFile(null);
      setPreviousYearExcelFile(null);
      setPreviousSecondYearExcelFile(null);
    } catch (err) {
      console.error("Excel upload failed", err);
      setUploadError(`Upload failed: ${err.message || "Please try again."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const flatColumnsToList = (columns) => {
    if (!Array.isArray(columns)) return [];
    return columns.flat().map((c) => String(c ?? "").trim()).filter(Boolean);
  };

  const handleSaveData = async () => {
    // Construct the final data object by merging original data with any updates
    const finalData = {
      ...feedbackOverallData,
      ...(initialPageEdits?.name !== undefined ? { name: initialPageEdits.name } : {}),
      ...(initialPageEdits?.date !== undefined ? { date: initialPageEdits.date } : {}),
      ...(surveyFeedbackEdits?.survey_question_count !== undefined
        ? { survey_question_count: surveyFeedbackEdits.survey_question_count }
        : {}),
      ...(surveyFeedbackEdits?.qualitative_question_count !== undefined
        ? { qualitative_question_count: surveyFeedbackEdits.qualitative_question_count }
        : {}),
      ...(surveyFeedbackEdits?.total_questions !== undefined
        ? { total_questions: surveyFeedbackEdits.total_questions }
        : {}),
      // Merge competency updates if they exist
      ...(averageCompentency || {}),
      ...(engagementEdits?.comparision_average
        ? { comparision_average: engagementEdits.comparision_average }
        : {}),
      ...(engagementEdits?.manager_comparision_average
        ? { manager_comparision_average: engagementEdits.manager_comparision_average }
        : {}),
      // Merge strengths and improvements edits
      strengths: {
        ...(feedbackOverallData?.strengths || {}),
        ...(strengthsEdits?.strengthsGroupItems ? { Subordinates: strengthsEdits.strengthsGroupItems.map(it => ({ score: it.score, question: it.text })) } : {}),
        ...(strengthsEdits?.strengthsManagerItems ? { Manager: strengthsEdits.strengthsManagerItems.map(it => ({ score: it.score, question: it.text })) } : {}),
      },
      area_of_improvement: {
        ...(feedbackOverallData?.area_of_improvement || {}),
        ...(strengthsEdits?.improvementsGroupItems ? { Subordinates: strengthsEdits.improvementsGroupItems.map(it => ({ score: it.score, question: it.text })) } : {}),
        ...(strengthsEdits?.improvementsManagerItems ? { Manager: strengthsEdits.improvementsManagerItems.map(it => ({ score: it.score, question: it.text })) } : {}),
      },
      ...(continueDoingEdits?.groups?.length
        ? { continue_doing_thing: continueDoingEdits.groups }
        : {}),
      ...(stopDoingEdits?.groups?.length
        ? { stop_doing_thing: stopDoingEdits.groups }
        : {}),
      ...(stopDoingEdits?.traits?.length
        ? { predominant_leader_most_thing: stopDoingEdits.traits }
        : {}),
      ...(predominantLeaderEdits?.groups?.length
        ? { predominant_leader_thing: predominantLeaderEdits.groups }
        : predominantLeaderEdits?.columns
          ? { predominant_leader_thing: flatColumnsToList(predominantLeaderEdits.columns) }
          : {}),
      ...(immediateActionEdits?.immediateActionColumns
        ? { action_areas_thing: immediateActionEdits.immediateActionColumns }
        : {}),
      ...(nomineeEdits?.adjectives?.length
        ? { workplace_culture: nomineeEdits.adjectives }
        : {}),
    };

    const payload = {
      feedback_data: [finalData],
      excel_name: currentYearExcelFile?.name || feedbackOverallData?.name || "Feedback Report",
      report_type: "feedback360"
    };

    if (draftId) {
      payload.feedback_draft_id = draftId;
    }

    try {
      setIsUploading(true); // Using isUploading as a general loading state
      if (draftId) {
        await updateFeedbackDraft(payload);
        setStatusModal({
          isOpen: true,
          type: "success",
          message: "Draft updated successfully!",
          title: "Update Success"
        });
      } else {
        await saveDraft(payload);
        setStatusModal({
          isOpen: true,
          type: "success",
          message: "Draft saved successfully!",
          title: "Save Success"
        });
      }
    } catch (error) {
      console.error("Failed to save draft", error);
      setStatusModal({
        isOpen: true,
        type: "error",
        message: error.message || "Failed to save draft. Please try again.",
        title: "Save Failed"
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setHeaderName("Feedback");

    if (draftId) {
      const fetchDraft = async () => {
        try {
          setIsUploading(true);
          const response = await getOneFeedbackDraft(draftId);
          if (response && response.feedback_data && response.feedback_data[0]) {
            setFeedbackOverallData(response.feedback_data[0]);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
          setStatusModal({
            isOpen: true,
            type: "error",
            message: "Failed to load draft. Please try again.",
            title: "Load Failed"
          });
        } finally {
          setIsUploading(false);
        }
      };
      fetchDraft();
    }
  }, [draftId]);

  return (
    <div className="feedbackreport-main-container">
      <GlobalLoader visible={isUploading} />
      <div className="feedbackreport-toolbar">
        <label className="feedbackreport-switch" title="Show comparison table">
          <input
            type="checkbox"
            checked={showComparisonTable}
            onChange={(e) => setShowComparisonTable(e.target.checked)}
          />
          <span className="feedbackreport-switch__track" aria-hidden="true">
            <span className="feedbackreport-switch__thumb" />
          </span>
          <span className="feedbackreport-switch__label">Show comparison table</span>
        </label>
        <button
          onClick={handleSaveData}
          className="feedbackreport-btn feedbackreport-btn--save"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
        >
          Save
        </button>
        {draftId && (
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="feedbackreport-btn feedbackreport-btn--save"
            style={{
              background: "#4f46e5",
              color: "#fff",
            }}
          >
            Share
          </button>
        )}
        <button
          onClick={downloadPdfSplitByHeader}
          className="feedbackreport-btn feedbackreport-btn--download"
        >
          Download PDF
        </button>
        <button
          type="button"
          onClick={openUploadModal}
          className={`feedbackreport-btn feedbackreport-btn--upload${
            isUploading ? " feedbackreport-btn--upload-disabled" : ""
          }`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Excel"}
        </button>
      </div>

      {isUploadModalOpen ? (
        <div
          className="feedbackreport-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Upload Excel Sheets"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeUploadModal();
          }}
        >
          <div className="feedbackreport-modal">
            <div className="feedbackreport-modal__header">
              <div className="feedbackreport-modal__title">
                <FileSpreadsheet size={20} />
                <span>Upload Excel Sheets</span>
              </div>
              <button
                type="button"
                className="feedbackreport-modal__close"
                onClick={closeUploadModal}
                disabled={isUploading}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="feedbackreport-modal__body feedbackreport-modal__body--scroll">
              <div className="feedbackreport-info-alert" role="note">
                <AlertCircle size={16} className="feedbackreport-info-alert__icon" />
                <div className="feedbackreport-info-alert__text">
                  Upload your Excel files to compare data between {file3Year} and {file2Year}. The primary file is required.
                </div>
              </div>

              <div className="feedbackreport-upload-stack">
                <div className="feedbackreport-upload-section">
                  <div className="feedbackreport-upload-section__header">
                    <div className="feedbackreport-upload-section__label">Primary File</div>
                  </div>

                  <input
                    ref={currentYearFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="feedbackreport-file-input"
                    onChange={(e) => {
                      setCurrentYearExcelFile(e.target.files?.[0] || null);
                      setUploadError("");
                      e.target.value = "";
                    }}
                  />

                  <div
                    className={`feedbackreport-dropzone${
                      currentYearExcelFile ? " feedbackreport-dropzone--has-file" : ""
                    }${dragOverKey === "file1" ? " feedbackreport-dropzone--dragover" : ""}`}
                    onClick={() =>
                      currentYearFileInputRef.current &&
                      currentYearFileInputRef.current.click()
                    }
                    onDrop={(e) => handleDrop("file1", e)}
                    onDragOver={(e) => handleDragOver("file1", e)}
                    onDragLeave={handleDragLeave}
                    role="button"
                    tabIndex={0}
                  >
                    {currentYearExcelFile ? (
                      <div className="feedbackreport-dropzone__file">
                        <div className="feedbackreport-dropzone__file-left">
                          <div className="feedbackreport-dropzone__file-icon">
                            <Check size={18} />
                          </div>
                          <div className="feedbackreport-dropzone__file-meta">
                            <div className="feedbackreport-dropzone__file-name">
                              {currentYearExcelFile.name}
                            </div>
                            <div className="feedbackreport-dropzone__file-size">
                              {(currentYearExcelFile.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="feedbackreport-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentYearExcelFile(null);
                          }}
                          aria-label="Remove file"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="feedbackreport-dropzone__empty">
                        <div className="feedbackreport-dropzone__upload-icon">
                          <Upload size={22} />
                        </div>
                        <div className="feedbackreport-dropzone__empty-text">
                          <div className="feedbackreport-dropzone__empty-title">
                            Click to upload or drag and drop
                          </div>
                          <div className="feedbackreport-dropzone__empty-subtitle">
                            Excel files only (.xlsx, .xls, .csv)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="feedbackreport-upload-section">
                  <div className="feedbackreport-upload-section__header">
                    <div className="feedbackreport-upload-section__label">
                      Comparison File ({file2Year})
                    </div>
                    <select
                      value={file2Year}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isFinite(next)) return;
                        setFile2Year(next);
                        if (next === file3Year) {
                          const candidate = next - 1;
                          if (yearOptions.includes(candidate)) setFile3Year(candidate);
                        }
                      }}
                      disabled={isUploading}
                      className="feedbackreport-year-select"
                      aria-label="Select year for File 2"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    ref={previousYearFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="feedbackreport-file-input"
                    onChange={(e) => {
                      setPreviousYearExcelFile(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                  />

                  <div
                    className={`feedbackreport-dropzone${
                      previousYearExcelFile ? " feedbackreport-dropzone--has-file" : ""
                    }${dragOverKey === "file2" ? " feedbackreport-dropzone--dragover" : ""}`}
                    onClick={() =>
                      previousYearFileInputRef.current &&
                      previousYearFileInputRef.current.click()
                    }
                    onDrop={(e) => handleDrop("file2", e)}
                    onDragOver={(e) => handleDragOver("file2", e)}
                    onDragLeave={handleDragLeave}
                    role="button"
                    tabIndex={0}
                  >
                    {previousYearExcelFile ? (
                      <div className="feedbackreport-dropzone__file">
                        <div className="feedbackreport-dropzone__file-left">
                          <div className="feedbackreport-dropzone__file-icon">
                            <Check size={18} />
                          </div>
                          <div className="feedbackreport-dropzone__file-meta">
                            <div className="feedbackreport-dropzone__file-name">
                              {previousYearExcelFile.name}
                            </div>
                            <div className="feedbackreport-dropzone__file-size">
                              {(previousYearExcelFile.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="feedbackreport-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviousYearExcelFile(null);
                          }}
                          aria-label="Remove file"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="feedbackreport-dropzone__empty">
                        <div className="feedbackreport-dropzone__upload-icon">
                          <Upload size={22} />
                        </div>
                        <div className="feedbackreport-dropzone__empty-text">
                          <div className="feedbackreport-dropzone__empty-title">
                            Click to upload or drag and drop
                          </div>
                          <div className="feedbackreport-dropzone__empty-subtitle">
                            Excel files only (.xlsx, .xls, .csv)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="feedbackreport-upload-section">
                  <div className="feedbackreport-upload-section__header">
                    <div className="feedbackreport-upload-section__label">
                      Comparison File ({file3Year})
                    </div>
                    <select
                      value={file3Year}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        if (!Number.isFinite(next)) return;
                        setFile3Year(next);
                        if (next === file2Year) {
                          const candidate = next + 1;
                          if (yearOptions.includes(candidate)) setFile2Year(candidate);
                        }
                      }}
                      disabled={isUploading}
                      className="feedbackreport-year-select"
                      aria-label="Select year for File 3"
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    ref={previousSecondYearFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="feedbackreport-file-input"
                    onChange={(e) => {
                      setPreviousSecondYearExcelFile(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                  />

                  <div
                    className={`feedbackreport-dropzone${
                      previousSecondYearExcelFile ? " feedbackreport-dropzone--has-file" : ""
                    }${dragOverKey === "file3" ? " feedbackreport-dropzone--dragover" : ""}`}
                    onClick={() =>
                      previousSecondYearFileInputRef.current &&
                      previousSecondYearFileInputRef.current.click()
                    }
                    onDrop={(e) => handleDrop("file3", e)}
                    onDragOver={(e) => handleDragOver("file3", e)}
                    onDragLeave={handleDragLeave}
                    role="button"
                    tabIndex={0}
                  >
                    {previousSecondYearExcelFile ? (
                      <div className="feedbackreport-dropzone__file">
                        <div className="feedbackreport-dropzone__file-left">
                          <div className="feedbackreport-dropzone__file-icon">
                            <Check size={18} />
                          </div>
                          <div className="feedbackreport-dropzone__file-meta">
                            <div className="feedbackreport-dropzone__file-name">
                              {previousSecondYearExcelFile.name}
                            </div>
                            <div className="feedbackreport-dropzone__file-size">
                              {(previousSecondYearExcelFile.size / 1024).toFixed(2)} KB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="feedbackreport-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviousSecondYearExcelFile(null);
                          }}
                          aria-label="Remove file"
                          disabled={isUploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="feedbackreport-dropzone__empty">
                        <div className="feedbackreport-dropzone__upload-icon">
                          <Upload size={22} />
                        </div>
                        <div className="feedbackreport-dropzone__empty-text">
                          <div className="feedbackreport-dropzone__empty-title">
                            Click to upload or drag and drop
                          </div>
                          <div className="feedbackreport-dropzone__empty-subtitle">
                            Excel files only (.xlsx, .xls, .csv)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="feedbackreport-comparison-tip">
                Comparison files will be used to compute comparison data ({file3Year} vs {file2Year}).
              </div>

              {uploadError ? (
                <div className="feedbackreport-upload-error">{uploadError}</div>
              ) : null}
            </div>

            <div className="feedbackreport-modal__footer">
              <button
                type="button"
                className="feedbackreport-btn feedbackreport-btn--secondary"
                onClick={closeUploadModal}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`feedbackreport-btn feedbackreport-btn--upload${
                  isUploading || !currentYearExcelFile
                    ? " feedbackreport-btn--upload-disabled"
                    : ""
                }`}
                onClick={handleThreeFileUpload}
                disabled={isUploading || !currentYearExcelFile}
              >
                <span className="feedbackreport-btn__icon" aria-hidden="true">
                  <Upload size={16} />
                </span>
                {isUploading ? "Uploading..." : "Upload Files"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        draftId={draftId}
      />
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        message={statusModal.message}
        title={statusModal.title}
      />
      <div className="section-page pdf-section">
        <FeedbackInitialPage
          initialName={
            feedbackOverallData?.name ? feedbackOverallData?.name : ""
          }
          date={
            feedbackOverallData?.date ? feedbackOverallData?.date : ""
          }
          onDataChange={handleInitialPageChange}
        />
      </div>
      <SurveyFeedback
        overviewData={feedbackOverallData}
        onDataChange={handleSurveyFeedbackChange}
      />

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
        onDataChange={handleStrengthsChange}
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
        onDataChange={handleCompetencyDataChange}
        totalResponse={feedbackOverallData?.total_response}
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
        onDataChange={handleCompetencyDataChange}
        totalResponse={feedbackOverallData?.total_response}
      />

      <EngagementWithManagementSummaryByCompetencyPage
        overallScore={computeOverallScore(
          feedbackOverallData?.engagement_with_management_competency || {},
        )}
        items={engagementWithManagementItems}
        comparisonAverage={
          feedbackOverallData?.comparision_average || []
        }
        managerComparisonAverage={
          feedbackOverallData?.manager_comparision_average || []
        }
        currentYear={currentYearLabel}
        file2Year={file2Year}
        file3Year={file3Year}
        setAverageCompentency={setAverageCompentency}
        onDataChange={handleEngagementDataChange}
        totalResponse={feedbackOverallData?.total_response}
        showComparisonTable={showComparisonTable}
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
        onDataChange={handleNomineeChange}
      />
      <ContinueDoingPage
      continue={true}
      onDataChange={handleContinueDoingChange}
        footnote={continueDoingFootnote}
        {...continueDoingPageProps}
      />
      <StopDoingPage
        onDataChange={handleStopDoingChange}
        tableFootnote={
          "*Similar comments with slight variations in wording will be grouped together for ease of reading and arranged in decreasing order of frequency"
        }
        footnote={"*This excludes self feedback"}
        {...stopDoingPageProps}
        traits={
          feedbackOverallData?.predominant_leader_most_thing
            ? feedbackOverallData?.predominant_leader_most_thing
            : []
        }
      />
      <ContinueDoingPage
        onDataChange={handlePredominantLeaderChange}
        title={"Predominant Leadership Trait"}
        subtitle={"- All Comments"}
        footnote={predominantLeaderFootnote}
        {...predominantLeaderPageProps}
      />
      <ContinueDoingPage
        onDataChange={handleImmediateActionChange}
        title={"Immediate Action Areas - Summary"}
        columns={[[], [], []]}
        footnote={""}
        immediateActionSummary={immediateActionAreasSummary}
      />
    </div>
  );
};

export default Feedback360Report;
