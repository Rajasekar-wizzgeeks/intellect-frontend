import React, { memo, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const GroupCommentsPopup = memo(function GroupCommentsPopup({
  open,
  group,
  onClose,
  onAddComment,
  onDeleteComment,
  itemStyle,
}) {
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!open) setNewComment("");
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="cd-group-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Group comments"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="cd-group-modal">
        <div className="cd-group-modal__header">
          <div className="cd-group-modal__title">Comments in this group</div>
          <button
            type="button"
            className="cd-group-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="cd-group-modal__body">
          <div className="cd-group-modal__rep-container">
            <div className="cd-group-modal__rep">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {(() => {
                  const raw = String(group?.representative_comment ?? "");
                  const match = raw.match(/^(.*?)(\(x\d+\)\s*)$/i);
                  const baseText = match ? match[1].trim() : raw;
                  const count = Array.isArray(group?.comments_belong_to_this_group)
                    ? group.comments_belong_to_this_group.length
                    : 0;
                  return count > 0 ? `${baseText} (x${count})` : baseText;
                })()}
              </ReactMarkdown>
            </div>
          </div>

          <div className="cd-group-modal__subhead">Group Comments</div>
          <div className="cd-group-modal__list" role="list">
            {(Array.isArray(group?.comments_belong_to_this_group)
              ? group.comments_belong_to_this_group
              : []
            ).map((c, i) => (
              <div
                key={i}
                className="cd-group-modal__item"
                role="listitem"
                style={itemStyle}
              >
                <div className="cd-group-modal__item-text">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {String(c ?? "")}
                  </ReactMarkdown>
                </div>
                <button
                  type="button"
                  className="cd-group-modal__delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComment?.(i);
                  }}
                  title="Delete comment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="cd-group-modal__add">
            <input
              className="cd-group-modal__input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const cleaned = String(newComment ?? "").trim();
                  if (cleaned) {
                    onAddComment?.(cleaned);
                    setNewComment("");
                  }
                }
              }}
              placeholder="Add a comment"
            />
            <button
              type="button"
              className="cd-group-modal__add-btn"
              onClick={(e) => {
                e.stopPropagation();
                const cleaned = String(newComment ?? "").trim();
                if (!cleaned) return;
                onAddComment?.(cleaned);
                setNewComment("");
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GroupCommentsPopup;
