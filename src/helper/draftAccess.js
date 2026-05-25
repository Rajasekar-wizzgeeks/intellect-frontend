/** Normalize access_type from getOneFeedbackDraft API. */
export const normalizeDraftAccessType = (accessType) => {
  const raw = String(accessType ?? "")
    .toLowerCase()
    .trim();
  if (raw === "owner" || raw === "editor") return "editor";
  if (raw === "viewer") return "viewer";
  return null;
};

const hasKnownAccessType = (accessType) => {
  const raw = String(accessType ?? "")
    .toLowerCase()
    .trim();
  return raw === "owner" || raw === "editor" || raw === "viewer";
};

/** Owner and editor can save; viewer and missing access_type cannot. */
export const canEditDraft = (accessType) => {
  const raw = String(accessType ?? "")
    .toLowerCase()
    .trim();
  return raw === "owner" || raw === "editor";
};

/** Share only when access_type is owner, editor, or viewer. */
export const canShareDraftAccess = (accessType) => hasKnownAccessType(accessType);

/** Only owner/editor can grant editor access in share modal. */
export const canGrantEditorAccess = (accessType) => canEditDraft(accessType);
