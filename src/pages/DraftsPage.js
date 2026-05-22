import React, { useEffect, useState, useRef } from "react";
import { getFeedbackDrafts } from "../helper/apicalls/feedback";
import { FileText, Clock, AlertCircle, Loader2, Calendar, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/draftsPage.scss";

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchDrafts = async () => {
      try {
        setLoading(true);
        const data = await getFeedbackDrafts();
        setDrafts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load drafts:", err);
        setError(err.message || "Failed to load drafts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardClick = (draft) => {
    let path = "/user/feedback";
    if (draft.reporttype === "lbscore360") {
      path = "/reports/user/draft";
    } else if (draft.reporttype === "dav360") {
      path = "/user/dav360";
    }
    navigate(`${path}?draft_id=${draft.id}`);
  };

  if (loading) {
    return (
      <div className="drafts-page">
        <div className="drafts-loading">
          <Loader2 className="animate-spin" />
          <p>Fetching your saved drafts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="drafts-page">
        <div className="drafts-error">
          <AlertCircle className="error-icon" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="drafts-page">
      <div className="drafts-header">
        <h1 className="drafts-title">Saved Drafts</h1>
        <p className="drafts-subtitle">Continue working on your saved reports and assessments</p>
      </div>

      {drafts.length === 0 ? (
        <div className="drafts-empty">
          <FileText className="empty-icon" />
          <p>No drafts found. Your saved progress will appear here.</p>
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map((draft) => (
            <div 
              key={draft.id} 
              className="draft-card" 
              onClick={() => handleCardClick(draft)}
            >
              <div className="draft-card__header">
                <div className="draft-card__icon-wrap">
                  <FileText size={24} />
                </div>
                <div className={`draft-card__type-badge ${
                  draft.reporttype === "lbscore360" ? "type-lbscore" : draft.reporttype === "dav360" ? "type-dav360" : "type-feedback"
                }`}>
                  {draft.reporttype === "lbscore360" ? "LBSCORE 360" : draft.reporttype === "dav360" ? "DAV 360" : "Feedback 360"}
                </div>
              </div>
              
              <div className="draft-card__body">
                <h3 className="draft-card__name" title={draft.excel_name}>
                  {draft.excel_name || "Untitled Report"}
                </h3>
                <div className="draft-card__info">
                  <div className="info-item">
                    <Clock size={14} />
                    <span>Updated: {formatDate(draft.updated_at)}</span>
                  </div>
                  <div className="info-item">
                    <Calendar size={14} />
                    <span>Created: {formatDate(draft.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="draft-card__footer">
                <button className="draft-card__btn btn-continue">
                  Continue Editing <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPage;
