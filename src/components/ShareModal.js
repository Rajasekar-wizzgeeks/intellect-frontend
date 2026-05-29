import React, { useState, useEffect } from "react";
import { X, Search, User, Shield, Eye, Loader2 } from "lucide-react";
import { getAllUsers, giveAccess } from "../helper/apicalls/feedback";
import { getApiErrorMessage } from "../helper/getApiErrorMessage";
import { canGrantEditorAccess } from "../helper/draftAccess";
import StatusModal from "./StatusModal";
import "../styles/shareModal.scss";

const ShareModal = ({ isOpen, onClose, draftId, draftUserAccessType }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [givingAccess, setGivingAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [accessType, setAccessType] = useState("viewers"); // 'viewers' or 'editors'
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: "success", message: "", title: "" });

  const allowEditorAccess = canGrantEditorAccess(draftUserAccessType);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (!allowEditorAccess) {
        setAccessType("viewers");
      }
    }
  }, [isOpen, allowEditorAccess]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveAccess = async () => {
    if (selectedUsers.length === 0 || !draftId) return;

    try {
      setGivingAccess(true);
      const payload = {
        feedback_draft_id: draftId,
        [accessType]: selectedUsers,
      };
      await giveAccess(payload);
      setStatusModal({
        isOpen: true,
        type: "success",
        message: "Access granted successfully!",
        title: "Access Granted"
      });
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to give access:", err);
      setStatusModal({
        isOpen: true,
        type: "error",
        message: getApiErrorMessage(err, "Failed to give access. Please try again."),
        title: "Access Failed"
      });
    } finally {
      setGivingAccess(false);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal(prev => ({ ...prev, isOpen: false }));
    if (statusModal.type === "success") {
      onClose();
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal__header">
          <h3 className="share-modal__title">Share Draft</h3>
          <button className="share-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="share-modal__body">
          <div className="share-modal__search-container">
            <Search className="share-modal__search-icon" size={18} />
            <input
              type="text"
              className="share-modal__search-input"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className={`share-modal__access-toggle${
              allowEditorAccess ? "" : " share-modal__access-toggle--viewer-only"
            }`}
          >
            <button
              type="button"
              className={`share-modal__toggle-btn ${accessType === "viewers" ? "active" : ""}`}
              onClick={() => setAccessType("viewers")}
            >
              <Eye size={16} /> Viewer
            </button>
            {allowEditorAccess ? (
              <button
                type="button"
                className={`share-modal__toggle-btn ${accessType === "editors" ? "active" : ""}`}
                onClick={() => setAccessType("editors")}
              >
                <Shield size={16} /> Editor
              </button>
            ) : null}
          </div>

          <div className="share-modal__user-list">
            {loading ? (
              <div className="share-modal__loading">
                <Loader2 className="animate-spin" size={24} />
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="share-modal__empty">No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`share-modal__user-item ${selectedUsers.includes(user.id) ? "selected" : ""}`}
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="share-modal__user-avatar">
                    <User size={20} />
                  </div>
                  <div className="share-modal__user-info">
                    <div className="share-modal__user-name">{user.name}</div>
                    <div className="share-modal__user-email">{user.email}</div>
                  </div>
                  <div className="share-modal__checkbox">
                    {selectedUsers.includes(user.id) && <div className="share-modal__checkbox-inner" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="share-modal__footer">
          <button className="share-modal__btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="share-modal__btn-submit"
            disabled={selectedUsers.length === 0 || givingAccess}
            onClick={handleGiveAccess}
          >
            {givingAccess ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Giving Access...
              </>
            ) : (
              `Give ${accessType === "viewers" ? "Viewer" : "Editor"} Access`
            )}
          </button>
        </div>
      </div>
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleStatusModalClose}
        type={statusModal.type}
        message={statusModal.message}
        title={statusModal.title}
      />
    </div>
  );
};

export default ShareModal;
