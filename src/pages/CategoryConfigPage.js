import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { Sliders, Plus, Edit2, Trash2, RefreshCw, Check, AlertCircle, Layers, Eye, X } from "lucide-react";
import {
  getCategoryConfigs,
  createCategoryConfig,
  updateCategoryConfig,
  deleteCategoryConfig,
  reorderCategoryConfigs,
} from "../helper/apicalls/feedback";
import { getApiErrorMessage } from "../helper/getApiErrorMessage";
import DeleteConfirmPopup from "../components/DeleteConfirmPopup";
import GlobalLoader from "../components/globalLoader";
import "../styles/categoryConfigPage.scss";

const ROLES = ["Delivery", "Business", "CORP", "CEO"];

const INITIAL_FORM = {
  name: "",
  description: "",
  feedback_key: "",
  order: 1,
  role_weights: { Delivery: 50, Business: 50, CORP: 50, CEO: 100 },
  behaviors: [""],
};

const CategoryConfigPage = () => {
  const { setHeaderName } = useOutletContext();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [previewCategory, setPreviewCategory] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setHeaderName("Overall Report Competency");
  }, [setHeaderName]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategoryConfigs();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load category configurations."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) + 1 : 1;
    const initial = {
      ...INITIAL_FORM,
      order: nextOrder,
    };
    setForm(initial);
    setOriginalForm(null);
    setFormStatus(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingId(category.id);
    const loadedForm = {
      name: category.name || "",
      description: category.description || "",
      feedback_key: category.feedback_key || "",
      order: category.order || 1,
      role_weights: {
        Delivery: category.role_weights?.Delivery ?? 50,
        Business: category.role_weights?.Business ?? 50,
        CORP: category.role_weights?.CORP ?? 50,
        CEO: category.role_weights?.CEO ?? 100,
      },
      behaviors: Array.isArray(category.behaviors) && category.behaviors.length > 0 ? [...category.behaviors] : [""],
    };
    setForm(loadedForm);
    setOriginalForm(loadedForm);
    setFormStatus(null);
    setIsModalOpen(true);
  };

  const isFormChanged = React.useMemo(() => {
    if (!editingId || !originalForm) return true;
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  }, [editingId, form, originalForm]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      name: val,
      feedback_key: editingId ? prev.feedback_key : (val ? `${val} Feedback` : ""),
    }));
  };

  const handleWeightChange = (role, val) => {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    setForm((prev) => ({
      ...prev,
      role_weights: {
        ...prev.role_weights,
        [role]: num,
      },
    }));
  };

  const handleBehaviorChange = (index, val) => {
    setForm((prev) => {
      const updated = [...prev.behaviors];
      updated[index] = val;
      return { ...prev, behaviors: updated };
    });
  };

  const handleAddBehavior = () => {
    setForm((prev) => ({
      ...prev,
      behaviors: [...prev.behaviors, ""],
    }));
  };

  const handleRemoveBehavior = (index) => {
    setForm((prev) => {
      const updated = prev.behaviors.filter((_, i) => i !== index);
      return { ...prev, behaviors: updated.length ? updated : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      setFormLoading(true);
      setFormStatus(null);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        feedback_key: form.feedback_key.trim(),
        role_weights: form.role_weights,
        behaviors: form.behaviors.map((b) => b.trim()).filter(Boolean),
      };
      if (editingId && form.order) {
        payload.order = Number(form.order);
      }

      if (editingId) {
        await updateCategoryConfig(editingId, payload);
        setFormStatus({ type: "success", message: "Category updated successfully!" });
      } else {
        await createCategoryConfig(payload);
        setFormStatus({ type: "success", message: "Category created successfully!" });
      }

      await fetchCategories();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormStatus(null);
      }, 800);
    } catch (err) {
      setFormStatus({
        type: "error",
        message: getApiErrorMessage(err, "Failed to save category config."),
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      await deleteCategoryConfig(deletingId);
      setDeletingId(null);
      await fetchCategories();
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete category config."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate order values sequentially
    const reorderPayload = updated.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));

    try {
      setLoading(true);
      setCategories(updated);
      await reorderCategoryConfigs(reorderPayload);
      await fetchCategories();
    } catch (err) {
      await fetchCategories(); // revert on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-config-page">
      <GlobalLoader visible={loading || formLoading || deleteLoading} />
      {/* Header Section */}
      <div className="category-config-page__header-section">
        <div className="category-config-page__title-group">
          <Sliders size={22} style={{ color: "var(--color-green-header)" }} />
          <h1>Overall Report Competency</h1>
          {!loading && <span className="category-config-page__count">{categories.length} Competencies</span>}
        </div>
        <div className="category-config-page__actions">
          <button
            className="category-config-page__btn category-config-page__btn--outline"
            onClick={fetchCategories}
            disabled={loading}
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            {/* <span>Refresh</span> */}
          </button>
          <button className="category-config-page__btn category-config-page__btn--primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="users-form__status users-form__status--error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Cards List */}
      <div className="category-cards-grid">
        {loading && categories.length === 0 ? (
          <div className="users-table__empty">Loading category configurations...</div>
        ) : categories.length === 0 ? (
          <div className="users-table__empty">No categories configured yet.</div>
        ) : (
          categories.map((cat, idx) => (
            <div
              key={cat.id || idx}
              className="category-card"
              onClick={() => setPreviewCategory(cat)}
              title="Click to preview category details"
            >
              <div className="category-card__top">
                <div className="category-card__header">
                  <div className="category-card__order-badge">{cat.order || idx + 1}</div>
                  <div>
                    <h2 className="category-card__name">
                      {cat.name}
                      <span className="category-card__feedback-key">{cat.feedback_key}</span>
                    </h2>
                  </div>
                </div>

                <div className="category-card__actions">
                  <button
                    className="category-card__action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewCategory(cat);
                    }}
                    title="Preview category details"
                  >
                    <Eye size={14} />
                    <span>Preview</span>
                  </button>
                  <button
                    className="category-card__action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(cat);
                    }}
                    title="Edit category"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="category-card__action-btn category-card__action-btn--delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(cat.id);
                    }}
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {cat.description && <p className="category-card__desc">{cat.description}</p>}

              <div className="category-card__meta-grid">
                <div className="category-card__meta-block">
                  <span className="category-card__meta-label">Role Weights</span>
                  <div className="category-card__weights-pills">
                    {ROLES.map((role) => (
                      <span key={role} className="category-card__weight-pill">
                        {role}: {cat.role_weights?.[role] ?? 50}%
                      </span>
                    ))}
                  </div>
                </div>

                <div className="category-card__meta-block">
                  <span className="category-card__meta-label">
                    Behaviors ({cat.behaviors?.length || 0})
                  </span>
                  <div className="category-card__behaviors-list">
                    {(cat.behaviors || []).slice(0, 2).map((b, i) => (
                      <div key={i} className="category-card__behavior-item">
                        {b}
                      </div>
                    ))}
                    {(cat.behaviors || []).length > 2 && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        + {cat.behaviors.length - 2} more...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Sliders size={20} />
                <span>{editingId ? "Edit Category Configuration" : "Add New Category Configuration"}</span>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form className="users-form" onSubmit={handleSubmit}>
              <div className="category-modal__section">
                <h3>General Settings</h3>
                <div className="category-modal__grid-2">
                  <div className="users-form__field">
                    <label className="users-form__label">Category Name (Excel Header) *</label>
                    <span className="users-form__hint">
                      Must match exact category name in Excel header
                    </span>
                    <input
                      type="text"
                      className="users-form__input"
                      placeholder="e.g., Leadership"
                      value={form.name}
                      onChange={handleNameChange}
                      required
                    />
                  </div>

                  <div className="users-form__field">
                    <label className="users-form__label">Feedback Key (Excel Header)</label>
                    <span className="users-form__hint">
                      Must match exact feedback key in Excel header
                    </span>
                    <input
                      type="text"
                      className="users-form__input"
                      placeholder="e.g., Leadership Feedback"
                      value={form.feedback_key}
                      onChange={(e) => setForm({ ...form, feedback_key: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* 
                <div className="users-form__field" style={{ maxWidth: "200px" }}>
                  <label className="users-form__label">Order</label>
                  <input
                    type="number"
                    className="users-form__input"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                */}

                <div className="users-form__field">
                  <label className="users-form__label">Description</label>
                  <textarea
                    className="users-form__input"
                    rows={2}
                    placeholder="Short description displayed in assessment introductory section..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="category-modal__section">
                <h3>Role Weights (%)</h3>
                <div className="category-modal__weights-grid">
                  {ROLES.map((role) => (
                    <div key={role} className="users-form__field">
                      <label className="users-form__label">{role}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="users-form__input"
                        value={form.role_weights[role] ?? 50}
                        onChange={(e) => handleWeightChange(role, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="category-modal__section">
                <h3>Behavioral Indicators (Snapshot Bullets)</h3>
                {form.behaviors.map((b, idx) => (
                  <div key={idx} className="category-modal__behavior-row">
                    <input
                      type="text"
                      className="users-form__input"
                      style={{ flex: 1 }}
                      placeholder={`Behavioral indicator ${idx + 1}...`}
                      value={b}
                      onChange={(e) => handleBehaviorChange(idx, e.target.value)}
                    />
                    {form.behaviors.length > 1 && (
                      <button
                        type="button"
                        className="category-modal__remove-btn"
                        onClick={() => handleRemoveBehavior(idx)}
                        title="Remove behavior"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="category-modal__add-behavior-btn" onClick={handleAddBehavior}>
                  <Plus size={14} />
                  <span>Add Behavioral Indicator</span>
                </button>
              </div>

              {formStatus && (
                <div className={`users-form__status users-form__status--${formStatus.type}`}>
                  {formStatus.type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
                  <span>{formStatus.message}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn modal-btn--cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--submit"
                  disabled={formLoading || !form.name.trim() || (Boolean(editingId) && !isFormChanged)}
                >
                  {formLoading ? "Saving..." : editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category Configuration?"
        message="Are you sure you want to delete this category? This will remove it from future report calculations."
        isDeleting={deleteLoading}
      />

      {/* Category Preview Modal */}
      {previewCategory && (
        <div className="modal-overlay" onClick={() => setPreviewCategory(null)}>
          <div className="modal-content category-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Eye size={20} style={{ color: "var(--color-green-header)" }} />
                <span>Category Details Preview</span>
              </div>
              <button className="modal-close" onClick={() => setPreviewCategory(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="category-preview-modal__body">
              {/* Head Info Card */}
              <div className="category-preview-modal__head-card">
                <div className="category-card__order-badge">
                  {previewCategory.order}
                </div>
                <div className="category-preview-modal__head-info">
                  <h2>{previewCategory.name}</h2>
                  <div className="category-preview-modal__tags">
                    <span className="category-preview-modal__tag">
                      <strong>Excel Header:</strong> {previewCategory.feedback_key}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {previewCategory.description && (
                <div className="category-preview-modal__section">
                  <h4 className="category-preview-modal__section-title">Description</h4>
                  <p className="category-preview-modal__desc-box">{previewCategory.description}</p>
                </div>
              )}

              {/* Role Weights */}
              <div className="category-preview-modal__section">
                <h4 className="category-preview-modal__section-title">Role Weights Breakdown</h4>
                <div className="category-preview-modal__weights-grid">
                  {ROLES.map((role) => {
                    const weight = previewCategory.role_weights?.[role] ?? 50;
                    return (
                      <div key={role} className="category-preview-modal__weight-card">
                        <div className="category-preview-modal__weight-meta">
                          <span className="category-preview-modal__weight-role">{role}</span>
                          <span className="category-preview-modal__weight-val">{weight}%</span>
                        </div>
                        <div className="category-preview-modal__progress-bar">
                          <div
                            className="category-preview-modal__progress-fill"
                            style={{ width: `${Math.min(100, Math.max(0, weight))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Behaviors */}
              <div className="category-preview-modal__section">
                <h4 className="category-preview-modal__section-title">
                  Behavioral Indicators ({previewCategory.behaviors?.length || 0})
                </h4>
                {previewCategory.behaviors && previewCategory.behaviors.length > 0 ? (
                  <div className="category-preview-modal__behaviors-list">
                    {previewCategory.behaviors.map((b, idx) => (
                      <div key={idx} className="category-preview-modal__behavior-item">
                        <span className="category-preview-modal__behavior-num">{idx + 1}</span>
                        <span className="category-preview-modal__behavior-text">{b}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="category-preview-modal__empty-text">No behavioral indicators defined.</p>
                )}
              </div>
            </div>

            <div className="category-preview-modal__footer">
              <button
                className="category-config-page__btn category-config-page__btn--outline"
                onClick={() => setPreviewCategory(null)}
              >
                Close
              </button>
              <button
                className="category-config-page__btn category-config-page__btn--primary"
                onClick={() => {
                  const catToEdit = previewCategory;
                  setPreviewCategory(null);
                  handleOpenEdit(catToEdit);
                }}
              >
                <Edit2 size={15} />
                <span>Edit Category</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryConfigPage;
