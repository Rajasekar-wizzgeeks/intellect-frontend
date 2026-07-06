import React, { useEffect, useRef, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { downloadPdfSplitByHeader } from "../utils/pdf";
import Dav360CoverPage from "../components/Dav360CoverPage";
import HeadlinesPage from "../components/HeadlinesPage";
import SummaryByCompetencyInstitutionPage from "../components/SummaryByCompetencyInstitutionPage";
import OverallAveragesByPrincipalPage from "../components/OverallAveragesByPrincipalPage";
import FrequentlyOccuringSuggestions from "../components/frequentlyOccuringSuggestions"
import LeaderComparisonPage from "../components/leaderComparisionPage"
import SurveySummaryRecap from "../components/SurveySummaryRecap"
import SectionTitle from "../components/SectionTitle"
import GlobalLoader from "../components/globalLoader";
import StatusModal from "../components/StatusModal";
import { excelSheetDav360Summary, getOneFeedbackDraft } from "../helper/apicalls/feedback";
import { getApiErrorMessage } from "../helper/getApiErrorMessage";
import { AlertCircle, Check, FileSpreadsheet, Upload, X, Download } from "lucide-react";
import "../styles/lbscore360.scss";
import "../styles/feedback360Report.scss";

const Dav360SummaryReport = () => {
  const { setHeaderName } = useOutletContext();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft_id");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("upload");
  const [excelFiles, setExcelFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "", title: "" });
  const fileInputRef = useRef(null);
  const draftFetched = useRef(false);

  useEffect(() => {
    setHeaderName("DAV 360 Report");

    if (draftId && !draftFetched.current) {
      draftFetched.current = true;
      const fetchDraft = async () => {
        try {
          setLoading(true);
          const response = await getOneFeedbackDraft(draftId);
          if (response && response.feedback_data && response.feedback_data[0]) {
            setReportData(response.feedback_data[0]);
            setPhase("report");
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
  }, [setHeaderName, draftId]);

  const handleExcelUpload = async () => {
    if (excelFiles.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const data = await excelSheetDav360Summary(excelFiles);
      setReportData(data);
      setPhase("report");
      setExcelFiles([]);
    } catch (err) {
      setError(err.message);
      console.error("Excel upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const isValidFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ["xlsx", "xls", "csv"].includes(ext);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(isValidFile);
    
    if (validFiles.length < files.length) {
      setError("Please upload a valid file");
    } else {
      setError(null);
    }
    
    if (validFiles.length > 0) {
      setExcelFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setExcelFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || []);
    const validFiles = files.filter(isValidFile);
    
    if (validFiles.length < files.length) {
      setError("Please upload a valid file");
    } else {
      setError(null);
    }
    
    if (validFiles.length > 0) {
      setExcelFiles((prev) => [...prev, ...validFiles]);
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

  const mapSummaryToRows = (data) => {
    if (!data) return null;
    
    const formatItem = ([text, scores], isTeam) => {
      const avg = isTeam ? scores.Subordinates : scores.Manager;
      return `${text} [Avg : ${avg || 0}]`;
    };

    const highest = [
      {
        label: "Team/Staff Perception",
        items: (data.hightest_team_avg || []).map((item) => formatItem(item, true)),
      },
      {
        label: "Management Perception",
        items: (data.hightest_manager_avg || []).map((item) => formatItem(item, false)),
      },
    ];

    const lowest = [
      {
        label: "Team/Staff Perception",
        items: (data.lowest_team_avg || []).map((item) => formatItem(item, true)),
      },
      {
        label: "Management Perception",
        items: (data.lowest_manager_avg || []).map((item) => formatItem(item, false)),
      },
    ];

    return { highest, lowest };
  };

  const summaryData = mapSummaryToRows(reportData?.summary_by_competency_for_the_institution);

  const mapPrincipalAverages = (data) => {
    if (!data) return null;
    const team = (data.team_summary || []).map((item) => ({
      name: item.employee,
      value: item.average,
      responses: item.responses,
    }));
    const manager = (data.manager_summary || []).map((item) => ({
      name: item.employee,
      value: item.average,
    }));
    return { team, manager };
  };

  const principalAverages = mapPrincipalAverages(reportData?.overall_principal_averages);

  const highestRows = summaryData?.highest || [];
  const lowestRows = summaryData?.lowest || [];
  const notes = reportData?.notes || [];

  const mapCompetencySummary = (data) => {
    if (!data) return [];
    const labelMap = {
      right_culture: "Creating the Right Culture",
      leadership_style: "Leadership Personality & Style",
      leadership_staff_dev: "Leadership for Staff Performance & Development",
      educational_quality: "Educational Quality & Student Outcomes",
      engagement_with_management: { label: "Engagement with Management", sub: "(Rated only by the Manager)" },
    };
    return Object.entries(labelMap).map(([key, info]) => {
      const values = data[key];
      if (!values) return null;
      const base = typeof info === "string" ? { label: info } : info;
      return { ...base, min: values.min, avg: values.avg, max: values.max };
    }).filter(Boolean);
  };

  const competencyItems = mapCompetencySummary(reportData?.institution_competency_summary);

  const teamRows = principalAverages?.team || [];
  const managerRows = principalAverages?.manager || [];

  if (phase === "upload") {
    return (
      <div className="lbs-upload-page">
        <GlobalLoader visible={loading} />
        <div className="lbs-upload-card">
          <div className="lbs-upload-card__header">
            <FileSpreadsheet size={22} />
            <span>Upload DAV 360° Summary Excel</span>
          </div>

          {/* Dropzone */}
          <div
            className={`lbs-dropzone${dragOver ? " lbs-dropzone--over" : ""}${excelFiles.length > 0 ? " lbs-dropzone--has-file" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {excelFiles.length > 0 ? (
              <div className="lbs-dropzone__file-list" onClick={(e) => e.stopPropagation()}>
                {excelFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="lbs-dropzone__file">
                    <Check size={16} color="var(--color-green)" />
                    <span className="lbs-dropzone__filename">{file.name}</span>
                    <button
                      className="lbs-dropzone__remove"
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="lbs-dropzone__add-more"
                  onClick={() => fileInputRef.current?.click()}
                >
                  + Add more files
                </button>
              </div>
            ) : (
              <div className="lbs-dropzone__empty">
                <Upload size={36} />
                <p className="lbs-dropzone__label">Click to upload or drag and drop</p>
                <p className="lbs-dropzone__hint">Excel or CSV files only (.xlsx, .xls, .csv)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="lbs-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

            <button
              className="lbs-upload-btn"
              onClick={handleExcelUpload}
              disabled={excelFiles.length === 0 || loading}
            >
              {loading ? "Processing..." : "Upload and Generate Report"}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedbackreport-main-container">
      <GlobalLoader visible={loading} />
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        message={statusModal.message}
        title={statusModal.title}
      />
      <div className="feedbackreport-toolbar">
        <button
          disabled={!reportData}
          onClick={downloadPdfSplitByHeader}
          className="feedbackreport-btn feedbackreport-btn--download"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {reportData ? (
        <>
          <Dav360CoverPage />
          <SurveySummaryRecap recap={reportData?.summary_framework_recap} />
          <HeadlinesPage headlines={reportData?.headlines} highestRows={highestRows} lowestRows={lowestRows} notes={notes} />
          <SummaryByCompetencyInstitutionPage items={competencyItems} />
          <OverallAveragesByPrincipalPage teamRows={teamRows} managerRows={managerRows} />
          <FrequentlyOccuringSuggestions data={reportData?.frequently_occuring_suggestions} />
          <SectionTitle />
          <LeaderComparisonPage data={reportData?.leadership_profile_data} />
        </>
      ) : (
        <div className="feedbackreport-empty-state">
          <div className="feedbackreport-empty-state__icon">
            <FileSpreadsheet size={64} />
          </div>
          <h2 className="feedbackreport-empty-state__title">No Report Data</h2>
          <p className="feedbackreport-empty-state__description">
            Please upload the DAV 360 Summary Excel files to generate the report.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dav360SummaryReport;
