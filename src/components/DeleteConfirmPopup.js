import React from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import "../styles/deleteConfirmPopup.scss";

const DeleteConfirmPopup = ({
  isOpen,
  onClose,
  onConfirm,
  draftName = "this draft",
  isDeleting = false,
  error = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="delete-confirm-popup-overlay"
      onClick={isDeleting ? undefined : onClose}
      role="presentation"
    >
      <div
        className="delete-confirm-popup"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-popup-title"
      >
        <button
          type="button"
          className="delete-confirm-popup__close"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="delete-confirm-popup__icon" aria-hidden="true">
          <AlertTriangle size={40} />
        </div>

        <h3 id="delete-confirm-popup-title" className="delete-confirm-popup__title">
          Delete draft?
        </h3>

        <p className="delete-confirm-popup__message">
          Are you sure you want to delete{" "}
          <strong>&quot;{draftName}&quot;</strong>? This action cannot be undone.
        </p>

        {error ? (
          <p className="delete-confirm-popup__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="delete-confirm-popup__actions">
          <button
            type="button"
            className="delete-confirm-popup__btn delete-confirm-popup__btn--cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-confirm-popup__btn delete-confirm-popup__btn--delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmPopup;
