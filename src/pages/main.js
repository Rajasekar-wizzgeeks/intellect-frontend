import React, { useEffect, useState, useMemo, useRef } from "react";
import InitialPage from "../components/initialPage";
import "../styles/mainPage.scss";
import Header from "../components/header";
import ReportInfoTable from "../components/reportInfoTable";
import ContentPage from "../components/contentPage";
import TableContentPage from "../components/tableContentPage";
import {
  downloadPdfSplitByHeader,
  // downloadDocxSplitByHeader,
} from "../utils/pdf";
import AboutAssessmentPages from "../components/aboutAssessmentPages";
import AboutSectionPages from "../components/aboutSectionPages";
import ScoringDefinition from "../components/ScoringDefinition";
import CompetencySummary from "../components/CompetencySummary";
import OverviewSummary from "../components/OverviewSummary";
import SpiderChartSummary from "../components/SpiderChartSummary";
import EvaluatorCategoryBreakdown from "../components/EvaluatorCategoryBreakdown";
import BehaviouralIndicators from "../components/BehaviouralIndicators";
import ParticipantCohortSummary from "../components/ParticipantCohortSummary";
import QualitativeFeedbackIntro from "../components/QualitativeFeedbackIntro";
import QualitativeFeedbackSection from "../components/QualitativeFeedbackSection";
import QualitativeFeedbackList from "../components/QualitativeFeedbackList";
import Highlights from "../components/Highlights";
import GlobalLoader from "../components/globalLoader";
import ShareModal from "../components/ShareModal";
import StatusModal from "../components/StatusModal";
import CoachingActionPlan from "../components/CoachingActionPlan";
import CoachingActionPlanPage2 from "../components/CoachingActionPlanPage2";
import IndividualDevelopmentPlan from "../components/IndividualDevelopmentPlan";
import BlindSpots from "../components/BlindSpots";
import ChessKingIcon from "../assets/png/chessKingIcon.png";
import MarketingIcon from "../assets/png/marketingIcon.png";
import ChessIcon from "../assets/png/chessIcon.png";
import EyeIcon from "../assets/png/eye.png";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { excelSheetLbScore360, saveDraft, getOneFeedbackDraft, updateFeedbackDraft } from "../helper/apicalls/feedback";
import { getApiErrorMessage } from "../helper/getApiErrorMessage";
import { canEditDraft, canShareDraftAccess } from "../helper/draftAccess";
import { AlertCircle, Check, FileSpreadsheet, Upload, X } from "lucide-react";

const MainPage = () => {
  const { setIsHeader, setHeaderName } = useOutletContext();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft_id");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [behaviouralEdits, setBehaviouralEdits] = useState({});
  const [overviewEdits, setOverviewEdits] = useState(null);
  const [evaluatorEdits, setEvaluatorEdits] = useState(null);
  const [qualitativeEdits, setQualitativeEdits] = useState({});
  const [highlightsEdits, setHighlightsEdits] = useState({});
  const [blindSpotsEdits, setBlindSpotsEdits] = useState({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [draftAccessType, setDraftAccessType] = useState(null);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "", title: "" });
  const fileInputRef = useRef(null);


  const QUALITATIVE_ROLES = ["Manager", "Peer", "Subordinate", "Self"];

const parseQualitativeComment = (c)=> {
  if (c && typeof c === "object" && c.role) {
    return { role: c.role, text: String(c.text ?? "") };
  }
  if (typeof c === "string") {
    for (const role of QUALITATIVE_ROLES) {
      const prefix = `${role}: `;
      if (c.startsWith(prefix)) {
        return { role, text: c.slice(prefix.length) };
      }
    }
  }
  return null;
}
  const handleExcelUpload = async () => {
    if (!excelFile) return;

    try {
      setLoading(true);
      setError(null);
      const data = await excelSheetLbScore360(excelFile);
      setReportData(data);
      setIsUploadModalOpen(false);
      setExcelFile(null);
    } catch (err) {
      setError(err.message);
      console.error("Excel upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      setExcelFile(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  useEffect(() => {
    // Optional: Auto-fetch if there's a default state or trigger
  }, []);

  const qualitativeSectionsData = useMemo(() => {
    if (!reportData?.feedbacks) return [];

    const feedbackData = reportData.feedbacks;
    const sections = [];

    // Define the mapping between API keys and local section headers
    const mapping = [
      { key: "Leadership Feedback", titleIndex: "3.1.", titleText: "Leadership" },
      { key: "Bandwidth Feedback", titleIndex: "3.2.", titleText: "Bandwidth" },
      { key: "Sales and Customer Centricity Feedback", titleIndex: "3.3.", titleText: "Sales & Customer Centricity" },
      { key: "Collaboration Feedback", titleIndex: "3.4.", titleText: "Collaboration" },
      { key: "Operational Excellence Feedback", titleIndex: "3.5.", titleText: "Operational Excellence" },
      { key: "Result Orientation Feedback", titleIndex: "3.6.", titleText: "Results Orientation" },
      { key: "Expertise and Communication Feedback", titleIndex: "3.7.", titleText: "Expertise & Communication" }
    ];

    mapping.forEach((m) => {
      const apiSection = feedbackData[m.key];
      if (apiSection && Array.isArray(apiSection)) {
        const questions = apiSection.map((qObj) => {
          const questionText = Object.keys(qObj)[0];
          const rolesData = qObj[questionText];

          const isPositive = /strength|effectively|positively|contribute/i.test(questionText);
          
          const allComments = [];
          if (rolesData) {
            ["Manager", "Peer", "Subordinate", "Self"].forEach(role => {
              if (Array.isArray(rolesData[role])) {
                rolesData[role].forEach(comment => {
                  if (comment) allComments.push({ role, text: comment });
                });
              }
            });
          }

          return {
            text: questionText,
            colorTheme: isPositive ? "green" : "gold",
            comments: allComments
          };
        });

        sections.push({
          titleIndex: m.titleIndex,
          titleText: m.titleText,
          questions: questions
        });
      }
    });

    return sections;
  }, [reportData]);

  const profileRows = useMemo(() => {
    const normalizeTypedObject = (payload) => {
      if (!payload) return null;
      if (payload && typeof payload === "object" && !Array.isArray(payload) && payload.type && payload.data) {
        return payload.data;
      }
      return payload;
    };

    const profile = normalizeTypedObject(reportData?.profile) || normalizeTypedObject(reportData?.introduction);
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) return undefined;

    const get = (key, ...fallbackKeys) => {
      if (profile?.[key] != null && String(profile[key]).trim() !== "") return profile[key];
      for (const k of fallbackKeys) {
        if (profile?.[k] != null && String(profile[k]).trim() !== "") return profile[k];
      }
      return "";
    };

    return [
      { label: "Associate Name", value: get("Associate Name", "associateName", "name") },
      { label: "Associate ID", value: get("Associate ID", "associateId", "employeeId") },
      { label: "Email ID", value: get("Email ID", "Email", "Email id", "email", "emailId") },
      { label: "Stream", value: get("Stream", "Role", "role", "stream") },
      { label: "LOB", value: get("LOB", "LOB / Unit", "lob") },
      { label: "Report Date", value: get("Report Date", "Date", "date", "ReportDate") },
      { label: "Assessed By", value: get("Assessed By", "assessedBy", "Assessedby") },
    ];
  }, [reportData]);

  const qualitativeSections = qualitativeSectionsData;

  const behaviouralIndicatorsData = useMemo(() => {
    if (!reportData?.behavioural_indications) return [];

    const rawData = reportData.behavioural_indications;
    
    return Object.entries(rawData).map(([indicatorText, dataArray]) => {
      const data = dataArray[0];
      const scores = data.score || {};
      const gaps = data.gap || {};
      const selfScore = scores.Self ?? 0;

      const cleanedIndicator = indicatorText.replace(/^\d+\.\s*/, "");

      return {
        indicator: cleanedIndicator,
        self: selfScore,
        others: [
          {
            label: "Manager",
            score: scores.Manager ?? 0,
            gapFromSelf: gaps.manager_gap ?? 0,
            highlight: "",
            color: "#b8860b",
          },
          {
            label: "Peer",
            score: scores.Peer ?? 0,
            gapFromSelf: gaps.peer_avg ?? 0,
            highlight: "",
            color: "#a9d0b8",
          },
          {
            label: "Team Members",
            score: scores.Subordinate ?? 0,
            gapFromSelf: gaps.subordinate_avg ?? 0,
            highlight: "",
            color: "#6b8e23",
          },
        ],
      };
    });
  }, [reportData]);

  const evaluatorCategoryBreakdownData = useMemo(() => {
    if (reportData?.evaluator_category_data) {
      return reportData.evaluator_category_data;
    }
    if (!reportData?.overall_behavioural_indications) return [];

    const rawData = reportData.overall_behavioural_indications;
    
    return Object.entries(rawData).map(([label, stats]) => {
      return {
        label: label,
        values: {
          self: stats.self_avg ?? 0,
          manager: stats.manager_avg ?? 0,
          team: stats.subordinate_avg ?? 0,
          peers: stats.peer_avg ?? 0,
        },
      };
    });
  }, [reportData]);

  const highlightsSections = useMemo(() => {
    const normalizeTypedPayload = (payload) => {
      if (!payload) return null;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return null;
    };

    const strengths =
      normalizeTypedPayload(reportData?.strengths) ||
      normalizeTypedPayload(reportData?.strengths_area_of_improvement?.strengths);

    const area_of_improvement =
      normalizeTypedPayload(reportData?.area_of_improvements) ||
      normalizeTypedPayload(reportData?.strengths_area_of_improvement?.area_of_improvements) ||
      normalizeTypedPayload(reportData?.strengths_area_of_improvement?.area_of_improvement);

    if (!strengths?.length && !area_of_improvement?.length) {
      return [];
    }

    return [
      {
        startPage: 45,
        titleIndex: "4.",
        titleText: "Highlights",
        subIndex: "4.1.",
        subText: "Strengths",
        note: "Below are the top 5 statements where you received the highest ratings and are considered your key strengths.",
        arcColor: "var(--color-green)",
        chipColor: "var(--color-green)",
        dotsColor: "var(--color-green)",
        leftIcon: ChessKingIcon,
        scoreShip: false,
        items: (Array.isArray(strengths) ? strengths : []).slice(0, 5).map((s) => ({
          score: s?.others ?? s?.others_avg ?? s?.score,
          title: "",
          desc: s?.question,
        })),
      },
      {
        startPage: 46,
        titleIndex: "4.",
        subIndex: "4.2.",
        subText: "Areas of Improvement",
        note: "Below are the 5 statements where you received the lowest ratings and are considered your areas of improvements.",
        arcColor: "var(--color-gold)",
        chipColor: "var(--color-gold)",
        dotsColor: "var(--color-gold)",
        scoreShip: true,
        leftIcon: MarketingIcon,
        items: (Array.isArray(area_of_improvement) ? area_of_improvement : [])
          .slice(0, 5)
          .map((a) => ({
            score: a?.others ?? a?.others_avg ?? a?.score,
            title: "",
            desc: a?.question,
          })),
      },
    ];
  }, [reportData]);

  const blindSpotsSectionsData = useMemo(() => {
    const normalizeTypedPayload = (payload) => {
      if (!payload) return null;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return null;
    };

    const hiddenRaw =
      normalizeTypedPayload(reportData?.hidden_strengths) ||
      normalizeTypedPayload(reportData?.blindspot_hiddentstrength?.hidden_strengths);

    const blindRaw =
      normalizeTypedPayload(reportData?.blind_spots) ||
      normalizeTypedPayload(reportData?.blindspot_hiddentstrength?.blind_spots);

    if (!hiddenRaw?.length && !blindRaw?.length) {
      return [];
    }

    const hidden_strengths = hiddenRaw || [];
    const blind_spots = blindRaw || [];

    return [
      {
        startPage: 47,
        subIndex: "4.3.",
        subText: "Hidden Strengths",
        note: " are behaviours/competencies where you have rated yourself lower than others, with a difference of ≥ 0.5 between your self-rating and the rating given by other raters. These are highlighted only when your self-rating is ≤ 3, meaning you tend to underrate yourself relative to how others experience you. Only the top 5 statements with the largest rating gaps are indicated.",
        arcColor: "var(--color-green)",
        chipColor: "var(--color-green)",
        leftIcon: ChessIcon,
        scoreShip: false,
        items: (Array.isArray(hidden_strengths) ? hidden_strengths : []).slice(0, 5).map(it => ({
          score: it?.gap ?? it?.score,
          desc: it?.question,
          self: it?.self_rating ?? it?.self,
          others: it?.others_rating ?? it?.others,
        })),
      },
      {
        startPage: 48,
        subIndex: "4.4.",
        subText: "Blind Spots",
        note: " are behaviours/ competencies where you have rated yourself higher than others with a difference of ≥ 0.5 between your self-rating and the rating given by others. These are highlighted only when self-rating is ≥3.5, indicating areas where you may be overestimating your effectiveness compared to how others experience you. Only the top 5 statements with the largest rating gaps are indicated.",
        arcColor: "var(--color-gold)",
        chipColor: "var(--color-gold)",
        scoreShip: true,
        leftIcon: EyeIcon,
        items: (Array.isArray(blind_spots) ? blind_spots : []).slice(0, 5).map(it => ({
          score: it?.gap ?? it?.score,
          desc: it?.question,
          self: it?.self_rating ?? it?.self,
          others: it?.others_rating ?? it?.others_avg ?? it?.others,
        })),
      },
    ];
  }, [reportData]);

  const spiderChartData = useMemo(() => {
    if (!reportData?.overall_behavioural_indications) return { categories: [], self: [], manager: [], others: [] };

    const rawData = reportData.overall_behavioural_indications;
    const categories = [];
    const self = [];
    const manager = [];
    const others = [];

    Object.entries(rawData).forEach(([label, stats]) => {
      categories.push(label);
      self.push(stats.self_avg ?? 0);
      manager.push(stats.manager_avg ?? 0);
      others.push(stats.spider_chart_others_avg ?? 0);
    });

    return { categories, self, manager, others };
  }, [reportData]);

  const overviewSummaryData = useMemo(() => {
    if (reportData?.overview_summary_data) {
      return reportData.overview_summary_data;
    }
    if (!reportData?.overall_behavioural_indications) return [];

    const rawData = reportData.overall_behavioural_indications;
    
    return Object.entries(rawData).map(([label, stats]) => {
      return {
        label: label,
        self: stats.self_avg ?? 0,
        others: stats.others_avg ?? 0,
      };
    });
  }, [reportData]);

  const canSaveDraft = draftId ? canEditDraft(draftAccessType) : true;
  const canShareDraft = draftId ? canShareDraftAccess(draftAccessType) : false;

  const saveDisabledTitle = !canSaveDraft
    ? draftId && !canShareDraftAccess(draftAccessType)
      ? "No access to edit this draft"
      : "View-only access"
    : undefined;

  const handleSaveData = async () => {
    if (!canSaveDraft) return;

    // Construct the final data object by merging original data with any updates
    const finalData = {
      ...reportData,
      behavioural_indications: {
        ...(reportData?.behavioural_indications || {}),
      },
      // Keep overview and evaluator data in separate fields as requested
      overview_summary_data: overviewSummaryData,
      evaluator_category_data: evaluatorCategoryBreakdownData,
    };

    // Update overview_summary_data if edits exist
    if (overviewEdits) {
      finalData.overview_summary_data = overviewEdits.map(row => ({
        label: row.label,
        self: Number(row.self),
        others: Number(row.others),
      }));
    }

    // Update evaluator_category_data if edits exist
    if (evaluatorEdits) {
      finalData.evaluator_category_data = evaluatorEdits.map(row => ({
        label: row.label,
        values: {
          self: Number(row.values.self),
          manager: Number(row.values.manager),
          team: Number(row.values.team),
          peers: Number(row.values.peers),
        }
      }));
    }

    // Merge behavioural edits if they exist
    if (Object.keys(behaviouralEdits).length > 0) {
        const indicatorsKeys = Object.keys(reportData?.behavioural_indications || {});
        Object.entries(behaviouralEdits).forEach(([idx, newRows]) => {
          const key = indicatorsKeys[idx];
          if (key && finalData.behavioural_indications[key] && finalData.behavioural_indications[key][0]) {
            const scores = {};
            newRows.forEach((row) => {
              const role = row.label === "Team Members" ? "Subordinate" : row.label;
              scores[role] = Number(row.score);
            });
  
            finalData.behavioural_indications[key][0] = {
              ...finalData.behavioural_indications[key][0],
              score: {
                ...finalData.behavioural_indications[key][0].score,
                ...scores,
              },
            };
          }
        });
      }

      // Merge qualitative feedback edits
      if (Object.keys(qualitativeEdits).length > 0) {
        Object.entries(qualitativeEdits).forEach(([sectionIdx, updatedQuestions]) => {
          const sectionKey = Object.keys(reportData.feedbacks)[sectionIdx];
          if (sectionKey) {
            finalData.feedbacks[sectionKey] = updatedQuestions.map((q) => {
              const questionText = q.text;
              const rolesData = {};
              q.comments.forEach((c) => {
                const parsed = parseQualitativeComment(c);
                if (!parsed?.role || !parsed.text) return;
                if (!rolesData[parsed.role]) rolesData[parsed.role] = [];
                rolesData[parsed.role].push(parsed.text);
              });
              return { [questionText]: rolesData };
            });
          }
        });
      }

      // Merge highlights edits (strengths and improvements)
      if (Object.keys(highlightsEdits).length > 0) {
        Object.entries(highlightsEdits).forEach(([idx, items]) => {
          const type = idx === "0" ? "strengths" : "area_of_improvements";
          finalData[type] = items.map((it) => ({
            question: it.desc,
            others_avg: Number(it.score),
          }));
        });
      }

      // Merge blind spots and hidden strengths edits
      if (Object.keys(blindSpotsEdits).length > 0) {
        Object.entries(blindSpotsEdits).forEach(([idx, items]) => {
          const type = idx === "0" ? "hidden_strengths" : "blind_spots";
          finalData[type] = items.map((it) => ({
            question: it.desc,
            self: Number(it.self),
            others: Number(it.others),
            gap: Number(it.score),
          }));
        });
      }

    const payload = {
      feedback_data: [finalData],
      excel_name: excelFile?.name || reportData?.name || "LBSCORE Report",
      report_type: "lbscore360"
    };

    if (draftId) {
      payload.feedback_draft_id = draftId;
    }

    try {
      setLoading(true);
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
        message: getApiErrorMessage(error, "Failed to save draft. Please try again."),
        title: "Save Failed"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeaderName("Report");

    if (draftId) {
      const fetchDraft = async () => {
        try {
          setLoading(true);
          const response = await getOneFeedbackDraft(draftId);
          setDraftAccessType(
            response?.access_type ?? response?.accessType ?? null,
          );
          if (response && response.feedback_data && response.feedback_data[0]) {
            setReportData(response.feedback_data[0]);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
          setStatusModal({
            isOpen: true,
            type: "error",
            message: getApiErrorMessage(error, "Failed to load draft. Please try again."),
            title: "Load Failed"
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDraft();
    }
  }, [draftId]);

  return (
    <div>
      <GlobalLoader visible={loading} />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "12px 16px",
          gap: 8,
        }}
      >
        <button
          onClick={handleSaveData}
          disabled={!canSaveDraft}
          title={saveDisabledTitle}
          style={{
            padding: "8px 14px",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: canSaveDraft ? "pointer" : "not-allowed",
            opacity: canSaveDraft ? 1 : 0.5,
          }}
        >
          Save
        </button>
        {draftId && (
          <button
            onClick={() => canShareDraft && setIsShareModalOpen(true)}
            disabled={!canShareDraft}
            title={!canShareDraft ? "No access to share this draft" : undefined}
            style={{
              padding: "8px 14px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: canShareDraft ? "pointer" : "not-allowed",
              opacity: canShareDraft ? 1 : 0.5,
            }}
          >
            Share
          </button>
        )}
        <button
          onClick={downloadPdfSplitByHeader}
          style={{
            padding: "8px 14px",
            background: "var(--color-green)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            // display: "none",
          }}
        >
          Download PDF
        </button>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          style={{
            padding: "8px 14px",
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Excel"}
        </button>
      </div>

      {isUploadModalOpen && (
        <div
          className="feedbackreport-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && setIsUploadModalOpen(false)}
        >
          <div
            className="feedbackreport-modal"
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "8px",
              width: "450px",
              maxWidth: "90%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                <FileSpreadsheet size={20} />
                <span>Upload LBSCORE 360 Excel</span>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div
              className={`feedbackreport-dropzone ${excelFile ? "feedbackreport-dropzone--has-file" : ""} ${
                dragOver ? "feedbackreport-dropzone--dragover" : ""
              }`}
              style={{
                border: "2px dashed #ccc",
                borderRadius: "8px",
                padding: "40px 20px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "#f0fdfa" : "#fafafa",
                borderColor: dragOver ? "var(--color-green)" : "#ccc",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {excelFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <Check size={20} color="green" />
                  <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {excelFile.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExcelFile(null);
                    }}
                    style={{ border: "none", background: "none", cursor: "pointer" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload size={32} style={{ marginBottom: "10px", color: "#666" }} />
                  <div style={{ fontWeight: "500" }}>Click to upload or drag and drop</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                    Excel files only (.xlsx, .xls, .csv)
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleExcelUpload}
                disabled={!excelFile || loading}
                style={{
                  padding: "10px 20px",
                  background: !excelFile || loading ? "#ccc" : "var(--color-green)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: !excelFile || loading ? "not-allowed" : "pointer",
                  width: "100%",
                  fontWeight: "600",
                }}
              >
                {loading ? "Processing..." : "Upload and Generate Report"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        draftId={draftId}
        draftUserAccessType={draftAccessType}
      />
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        message={statusModal.message}
        title={statusModal.title}
      />
      <div className="section-page-container">
        <section className="section-page pdf-section">
          <InitialPage initialName={reportData?.name || ""} />
        </section>
        <section className="section-page pdf-section">
          <ContentPage rows={profileRows} />
        </section>
        <section className="section-page pdf-section">
          <TableContentPage />
        </section>
        <AboutAssessmentPages />
        <AboutSectionPages />
        <ScoringDefinition />
        <AboutSectionPages
          titleIndex="1.4."
          titleText="LBSCORE Element Snapshot"
          sections={[
            {
              chip: "Leadership",
              items: [
                {
                  tail: "Crafts and communicates a clear, future-ready direction aligned with Intellect’s values",
                },
                {
                  tail: "Creates an environment where people feel safe to question assumptions, learn, and contribute openly",
                },
                {
                  tail: "Makes sound decisions by combining structured thinking, diverse perspectives, and professional judgement",
                },
                {
                  tail: "Invests time and intent in developing talent and building leadership capability in others",
                },
                {
                  tail: "Encourages teams to think beyond immediate tasks and consider broader, system-wide impact",
                },
              ],
            },
            {
              chip: "Bandwidth",
              items: [
                {
                  tail: "Remains calm and decisive in ambiguous or high-pressure situations",
                },
                {
                  tail: "Breaks down complex goals into clear priorities and manageable work components",
                },
                {
                  tail: "Thinks across strategic, operational, and delivery lenses without losing focus",
                },
                {
                  tail: "Mobilises people and resources through networks and influence, not just hierarchy",
                },
                {
                  tail: "Challenges existing ways of working to simplify execution and improve predictability",
                },
              ],
            },
            {
              chip: "Sales & Customer Centricity",
              items: [
                {
                  tail: "Seeks deep customer and market understanding through data, observation, and dialogue",
                },
                {
                  tail: "Anticipates underlying needs and emerging opportunities beyond stated requirements",
                },
                {
                  tail: "Designs solutions that deliver meaningful value and strengthen long-term partnerships",
                },
                {
                  tail: "Communicates a clear and consistent customer experience across functions and touchpoints",
                },
                {
                  tail: "Positions offerings with a focus on outcomes and shared success",
                },
              ],
            },
            {
              chip: "Sales & Customer Centricity",
              items: [
                {
                  tail: "Seeks deep customer and market understanding through data, observation, and dialogue",
                },
                {
                  tail: "Anticipates underlying needs and emerging opportunities beyond stated requirements",
                },
                {
                  tail: "Designs solutions that deliver meaningful value and strengthen long-term partnerships",
                },
                {
                  tail: "Communicates a clear and consistent customer experience across functions and touchpoints",
                },
                {
                  tail: "Positions offerings with a focus on outcomes and shared success",
                },
              ],
            },
            {
              chip: "Sales & Customer Centricity",
              items: [
                {
                  tail: "Seeks deep customer and market understanding through data, observation, and dialogue",
                },
                {
                  tail: "Anticipates underlying needs and emerging opportunities beyond stated requirements",
                },
                {
                  tail: "Designs solutions that deliver meaningful value and strengthen long-term partnerships",
                },
                {
                  tail: "Communicates a clear and consistent customer experience across functions and touchpoints",
                },
                {
                  tail: "Positions offerings with a focus on outcomes and shared success",
                },
              ],
            },
            {
              chip: "Sales & Customer Centricity",
              items: [
                {
                  tail: "Seeks deep customer and market understanding through data, observation, and dialogue",
                },
                {
                  tail: "Anticipates underlying needs and emerging opportunities beyond stated requirements",
                },
                {
                  tail: "Designs solutions that deliver meaningful value and strengthen long-term partnerships",
                },
                {
                  tail: "Communicates a clear and consistent customer experience across functions and touchpoints",
                },
                {
                  tail: "Positions offerings with a focus on outcomes and shared success",
                },
              ],
            },
            {
              chip: "Sales & Customer Centricity",
              items: [
                {
                  tail: "Seeks deep customer and market understanding through data, observation, and dialogue",
                },
                {
                  tail: "Anticipates underlying needs and emerging opportunities beyond stated requirements",
                },
                {
                  tail: "Designs solutions that deliver meaningful value and strengthen long-term partnerships",
                },
                {
                  tail: "Communicates a clear and consistent customer experience across functions and touchpoints",
                },
                {
                  tail: "Positions offerings with a focus on outcomes and shared success",
                },
              ],
            },
          ]}
        />
        <CompetencySummary overallScore={reportData?.overall_score || 370} />
        <OverviewSummary
          items={overviewEdits || overviewSummaryData}
          onDataChange={(nextRows) => setOverviewEdits(nextRows)}
        />
        <SpiderChartSummary
          categories={spiderChartData.categories}
          self={spiderChartData.self}
          manager={spiderChartData.manager}
          others={spiderChartData.others}
        />
        <EvaluatorCategoryBreakdown
          items={evaluatorEdits || evaluatorCategoryBreakdownData}
          onDataChange={(nextRows) => setEvaluatorEdits(nextRows)}
        />
        <BehaviouralIndicators
          items={behaviouralIndicatorsData}
          onDataChange={(idx, newRows) => {
            setBehaviouralEdits((prev) => ({
              ...prev,
              [idx]: newRows,
            }));
          }}
        />
        <ParticipantCohortSummary
          competencies={reportData?.participant_cohort_summary?.competencies}
          selfRatings={reportData?.participant_cohort_summary?.self_ratings}
          cohortRatings={reportData?.participant_cohort_summary?.cohort_ratings}
        />
        <QualitativeFeedbackIntro />
        {qualitativeSections.map((sec, i) => (
          <QualitativeFeedbackList
            key={`qsec-${i}`}
            startPage={31 + i}
            titleIndex={sec.titleIndex}
            titleText={sec.titleText}
            questions={qualitativeEdits[i] || sec.questions}
            onDataChange={(nextQuestions) => {
              setQualitativeEdits((prev) => ({
                ...prev,
                [i]: nextQuestions,
              }));
            }}
          />
        ))}
        {highlightsSections.map((sec, i) => {
          const liveItems = highlightsEdits[i] || sec.items;
          return (
            <Highlights
              key={`hl-${i}`}
              {...sec}
              items={liveItems}
              onDataChange={(nextItems) => {
                setHighlightsEdits((prev) => ({
                  ...prev,
                  [i]: nextItems,
                }));
              }}
            />
          );
        })}
        {blindSpotsSectionsData.map((sec, i) => {
          const liveItems = blindSpotsEdits[i] || sec.items;
          return (
            <BlindSpots
              key={`bs-${i}`}
              startPage={sec.startPage}
              titleIndex={sec.subIndex}
              titleText={sec.subText}
              description={sec.note}
              arcColor={sec.arcColor}
              chipColor={sec.chipColor}
              leftIcon={sec.leftIcon}
              items={liveItems.map((it) => ({
                score: it.score ?? 2.5,
                desc: it.desc ?? "Text",
                self: it.self,
                others: it.others,
              }))}
              scoreShip={sec.scoreShip}
              key_id={`bs-${i}`}
              onDataChange={(nextItems) => {
                setBlindSpotsEdits((prev) => ({
                  ...prev,
                  [i]: nextItems,
                }));
              }}
            />
          );
        })}
        <CoachingActionPlan />
        <CoachingActionPlanPage2 />
        <IndividualDevelopmentPlan />
      </div>
    </div>
  );
};

export default MainPage;
