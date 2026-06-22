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
import { AlertCircle, FileSpreadsheet, Upload, X, Download } from "lucide-react";
import "../styles/feedback360Report.scss";

const Dav360SummaryReport = () => {
  const { setHeaderName } = useOutletContext();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draft_id");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [excelFiles, setExcelFiles] = useState([]);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "", title: "" });
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
      setIsUploadModalOpen(false);
      setExcelFiles([]);
    } catch (err) {
      setError(err.message);
      console.error("Excel upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setExcelFiles((prev) => [...prev, ...files]);
      setError(null);
    }
  };

  const removeFile = (index) => {
    setExcelFiles((prev) => prev.filter((_, i) => i !== index));
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
          onClick={() => setIsUploadModalOpen(true)}
          className="feedbackreport-btn feedbackreport-btn--upload"
        >
          <Upload size={18} />
          Upload Excel
        </button>
        <button
          disabled={!reportData}
          onClick={downloadPdfSplitByHeader}
          className="feedbackreport-btn feedbackreport-btn--download"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {isUploadModalOpen && (
        <div className="feedbackreport-modal-overlay">
          <div className="feedbackreport-modal">
            <div className="feedbackreport-modal__header">
              <h3 className="feedbackreport-modal__title">Upload DAV 360 Summary Excel</h3>
              <button className="feedbackreport-modal__close" onClick={() => setIsUploadModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="feedbackreport-modal__body">
              <div 
                className={`feedbackreport-dropzone ${excelFiles.length > 0 ? 'feedbackreport-dropzone--has-file' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('feedbackreport-dropzone--dragover');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('feedbackreport-dropzone--dragover');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('feedbackreport-dropzone--dragover');
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    setExcelFiles((prev) => [...prev, ...files]);
                  }
                }}
              >
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  id="excel-upload"
                  className="feedbackreport-file-input"
                  multiple
                />
                <label htmlFor="excel-upload" className="feedbackreport-dropzone__empty">
                  <div className="feedbackreport-dropzone__upload-icon">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div className="feedbackreport-dropzone__empty-title">
                    Choose or drag Excel files
                  </div>
                  <div className="feedbackreport-dropzone__empty-subtitle">
                    Supports .xlsx, .xls files
                  </div>
                </label>
              </div>

              {excelFiles.length > 0 && (
                <div className="feedbackreport-file-list">
                  {excelFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="feedbackreport-file-item">
                      <FileSpreadsheet size={16} className="feedbackreport-file-item__icon" />
                      <span className="feedbackreport-file-item__name">{file.name}</span>
                      <button 
                        className="feedbackreport-file-item__remove" 
                        onClick={() => removeFile(index)}
                        title="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="feedbackreport-upload-error">
                  <AlertCircle size={16} className="feedbackreport-btn__icon" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <div className="feedbackreport-modal__footer">
              <button
                className="feedbackreport-btn feedbackreport-btn--secondary"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setExcelFiles([]);
                }}
              >
                Cancel
              </button>
              <button
                className="feedbackreport-btn feedbackreport-btn--upload"
                disabled={excelFiles.length === 0 || loading}
                onClick={handleExcelUpload}
              >
                {loading ? "Processing..." : "Upload & Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportData ? (
        <>
          <Dav360CoverPage />
          <SurveySummaryRecap recap={reportData?.summary_framework_recap} />
          <HeadlinesPage headlines={reportData?.headlines} highestRows={highestRows} lowestRows={lowestRows} notes={notes} />
          <SummaryByCompetencyInstitutionPage items={competencyItems} />
          <OverallAveragesByPrincipalPage teamRows={teamRows} managerRows={managerRows} />
          <FrequentlyOccuringSuggestions />
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
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="feedbackreport-btn feedbackreport-btn--upload"
          >
            <Upload size={18} />
            Upload Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default Dav360SummaryReport;
