import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Trash2, Edit2, Plus, X, Check, ArrowRight } from "lucide-react";
import "../styles/continueDoingPage.scss";

const AutoResizeTextarea = ({ value, onChange, onKeyDown, onBlur, autoFocus, className, placeholder }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      autoFocus={autoFocus}
      placeholder={placeholder}
      rows={1}
    />
  );
};

const GroupCommentsModal = ({
  isOpen,
  onClose,
  selectedGroup,
  onUpdateGroup,
  onMoveComment,
  columnCount,
}) => {
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingRep, setIsEditingRep] = useState(false);
  const [repEditValue, setRepEditValue] = useState("");

  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const [pendingMoveIdx, setPendingMoveIdx] = useState(null);

  if (!isOpen || !selectedGroup) return null;

  const safeColumnCount =
    typeof columnCount === "number" && columnCount > 0
      ? Math.floor(columnCount)
      : 3;

  const comments = Array.isArray(selectedGroup.comments_belong_to_this_group)
    ? selectedGroup.comments_belong_to_this_group
    : [];

  const closeColumnPicker = () => {
    setIsColumnPickerOpen(false);
    setPendingMoveIdx(null);
  };

  const handleUpdateRep = () => {
    if (repEditValue.trim()) {
      const oldRep = selectedGroup.representative_comment;
      onUpdateGroup({
        ...selectedGroup,
        representative_comment: repEditValue.trim(),
      }, oldRep);
      setIsEditingRep(false);
    }
  };

  const handleRepKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdateRep();
    } else if (e.key === "Escape") {
      setIsEditingRep(false);
    }
  };

  const handleUpdate = (idx, newValue) => {
    const nextComments = [...comments];
    if (newValue.trim()) {
      nextComments[idx] = newValue;
      onUpdateGroup({
        ...selectedGroup,
        comments_belong_to_this_group: nextComments,
      });
    }
    setEditingIdx(null);
  };

  const handleKeyDown = (e, idx, value) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUpdate(idx, value);
    } else if (e.key === "Escape") {
      setEditingIdx(null);
    }
  };

  const handleDelete = (idx) => {
    const nextComments = comments.filter((_, i) => i !== idx);
    onUpdateGroup({
      ...selectedGroup,
      comments_belong_to_this_group: nextComments,
    });
  };

  const handleAdd = () => {
    if (newComment.trim()) {
      const nextComments = [...comments, newComment.trim()];
      onUpdateGroup({
        ...selectedGroup,
        comments_belong_to_this_group: nextComments,
      });
      setNewComment("");
      setIsAdding(false);
    }
  };

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewComment("");
    }
  };

  return (
    <div className="cd-group-modal-overlay" onClick={onClose}>
      <div className="cd-group-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-group-modal__header">
          <span className="cd-group-modal__title">Comments in this group</span>
          <button className="cd-group-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="cd-group-modal__body">
          <div className="cd-group-modal__rep-container">
            <div className="cd-group-modal__rep-header-row">
              <div className="cd-group-modal__rep-header">Representative Comment</div>
            </div>
            <div className={`cd-group-modal__rep ${isEditingRep ? 'cd-group-modal__rep--editing' : ''}`}>
              {isEditingRep ? (
                <AutoResizeTextarea
                  className="cd-group-modal__textarea"
                  value={repEditValue}
                  onChange={(e) => setRepEditValue(e.target.value)}
                  onKeyDown={handleRepKeyDown}
                  onBlur={handleUpdateRep}
                  autoFocus
                />
              ) : (
                <div 
                  className="cd-group-modal__display-text"
                  onDoubleClick={() => {
                    setIsEditingRep(true);
                    setRepEditValue(selectedGroup.representative_comment);
                  }}
                >
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {selectedGroup.representative_comment}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          <div className="cd-group-modal__subhead-row">
            <div className="cd-group-modal__subhead">All Comments ({comments.length})</div>
            <button 
              className="cd-group-modal__add-trigger"
              onClick={() => setIsAdding(true)}
              title="Add Comment"
            >
              <Plus size={16} /> Add Comment
            </button>
          </div>

          <div className="cd-group-modal__list">
            {isAdding && (
              <div className="cd-group-modal__item cd-group-modal__item--editing">
                <AutoResizeTextarea
                  className="cd-group-modal__textarea"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  onBlur={handleAdd}
                  placeholder="Type new comment..."
                  autoFocus
                />
              </div>
            )}

            {comments.map((c, i) => (
              <div key={i} className={`cd-group-modal__item ${editingIdx === i ? 'cd-group-modal__item--editing' : ''}`}>
                {editingIdx === i ? (
                  <AutoResizeTextarea
                    className="cd-group-modal__textarea"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, i, editValue)}
                    onBlur={() => handleUpdate(i, editValue)}
                    autoFocus
                  />
                ) : (
                  <>
                    <div 
                      className="cd-group-modal__item-text"
                      onDoubleClick={() => { setEditingIdx(i); setEditValue(c); }}
                    >
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{c}</ReactMarkdown>
                    </div>
                    <div className="cd-group-modal__item-actions">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPendingMoveIdx(i);
                          setIsColumnPickerOpen(true);
                        }}
                        className="cd-group-modal__action-btn cd-group-modal__action-btn--move"
                        title="Move to end of table"
                        type="button"
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(i)} 
                        className="cd-group-modal__action-btn cd-group-modal__action-btn--delete"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {isColumnPickerOpen ? (
          <div
            className="cd-group-modal__column-picker-overlay"
            onClick={closeColumnPicker}
          >
            <div
              className="cd-group-modal__column-picker"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="cd-group-modal__column-picker-title">
                    Which column would you like to add this comment to?              
              </div>
              <div className="cd-group-modal__column-picker-actions">
                {Array.from({ length: safeColumnCount }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="cd-group-modal__column-picker-btn"
                    onClick={() => {
                      if (pendingMoveIdx == null) return;
                      onMoveComment?.(pendingMoveIdx, idx);
                      closeColumnPicker();
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="cd-group-modal__column-picker-cancel"
                onClick={closeColumnPicker}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GroupCommentsModal;
