import React, { useEffect, useState, useRef, useMemo } from "react";
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
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from "lucide-react";

const Feedback360Report = () => {
  const [feedbackOverallData, setFeedbackOverallData] = useState(null);
  const { setHeaderName } = useOutletContext();
  const [isUploading, setIsUploading] = useState(false);
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
      <div className="section-page pdf-section">
        <FeedbackInitialPage
          initialName={
            feedbackOverallData?.name ? feedbackOverallData?.name : ""
          }
          date={
            feedbackOverallData?.date ? feedbackOverallData?.date : ""
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
        totalResponse={feedbackOverallData?.total_response}
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
      continue={true}
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
        title={"Predominant Leadership Trait"}
        subtitle={"- All Comments"}
        columns={buildThreeTextColumns(
          feedbackOverallData?.predominant_leader_thing,
        )}
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
