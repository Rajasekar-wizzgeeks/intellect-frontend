import React, { useEffect, useState } from "react";
import { getFeedbackDrafts, deleteFeedbackDraft } from "../helper/apicalls/feedback";
import DeleteConfirmPopup from "../components/DeleteConfirmPopup";
import Pagination from "../components/Pagination";
import { FileText, Clock, AlertCircle, Loader2, Calendar, ArrowRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/draftsPage.scss";

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, per_page: 10, total_pages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [draftToDelete, setDraftToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  const fetchDrafts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFeedbackDrafts(page);
      if (data && data.data && data.pagination) {
        setDrafts(data.data);
        setPagination(data.pagination);
      } else {
        setDrafts(Array.isArray(data) ? data : []);
        setPagination({ total: 0, page: 1, per_page: 10, total_pages: 1 });
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
      setError(err.message || "Failed to load drafts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.endsWith("Z") ? dateString : dateString + "Z");
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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

  const openDeleteConfirm = (e, draft) => {
    e.stopPropagation();
    if (!draft?.id || deletingId) return;
    setDeleteError("");
    setDraftToDelete(draft);
  };

  const closeDeleteConfirm = () => {
    if (deletingId) return;
    setDraftToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!draftToDelete?.id || deletingId) return;
    try {
      setDeletingId(draftToDelete.id);
      setDeleteError("");
      await deleteFeedbackDraft(draftToDelete.id);
      setDraftToDelete(null);
      const newTotal = pagination.total - 1;
      const newTotalPages = Math.ceil(newTotal / pagination.per_page);
      const targetPage = currentPage > newTotalPages && newTotalPages > 0 ? newTotalPages : currentPage;
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      } else {
        fetchDrafts(currentPage);
      }
    } catch (err) {
      console.error("Failed to delete draft:", err);
      setDeleteError(err.message || "Failed to delete draft. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.total_pages || page === currentPage) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      {drafts.length === 0 ? (
        <div className="drafts-empty">
          <FileText className="empty-icon" />
          <p>No drafts found. Your saved progress will appear here.</p>
        </div>
      ) : (
        <>
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
                  <div className="draft-card__header-actions">
                    <div className={`draft-card__type-badge ${
                      draft.reporttype === "lbscore360" ? "type-lbscore" : draft.reporttype === "dav360" ? "type-dav360" : "type-feedback"
                    }`}>
                      {draft.reporttype === "lbscore360" ? "LBSCORE 360" : draft.reporttype === "dav360" ? "DAV 360" : "Feedback 360"}
                    </div>
                    <button
                      type="button"
                      className="draft-card__delete"
                      onClick={(e) => openDeleteConfirm(e, draft)}
                      disabled={deletingId === draft.id}
                      aria-label={`Delete ${draft.excel_name || "draft"}`}
                      title="Delete draft"
                    >
                      {deletingId === draft.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
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
          <Pagination
            page={pagination.page}
            totalPages={pagination.total_pages}
            total={pagination.total}
            perPage={pagination.per_page}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <DeleteConfirmPopup
        isOpen={Boolean(draftToDelete)}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDelete}
        draftName={draftToDelete?.excel_name || "Untitled Report"}
        isDeleting={Boolean(deletingId)}
        error={deleteError}
      />
    </div>
  );
};

export default DraftsPage;
