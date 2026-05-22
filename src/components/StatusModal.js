import React from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import "../styles/statusModal.scss";

const StatusModal = ({ isOpen, onClose, type = "success", message, title }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div className="status-modal" onClick={(e) => e.stopPropagation()}>
        <button className="status-modal__close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="status-modal__content">
          <div className={`status-modal__icon ${isSuccess ? "success" : "error"}`}>
            {isSuccess ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>
          
          <h3 className="status-modal__title">
            {title || (isSuccess ? "Success!" : "Error")}
          </h3>
          
          <p className="status-modal__message">{message}</p>
          
          <button 
            className={`status-modal__btn ${isSuccess ? "success" : "error"}`}
            onClick={onClose}
          >
            {isSuccess ? "Continue" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;
