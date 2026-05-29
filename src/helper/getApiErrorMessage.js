/** Extract a human-readable message from a typical API error JSON body. */
export const parseApiErrorBody = (body) => {
  if (!body) return "";
  if (typeof body === "string") return body.trim();

  if (typeof body !== "object") return "";

  const candidates = [
    body.message,
    body.error,
    body.msg,
    body.detail,
    body.description,
    Array.isArray(body.errors) && typeof body.errors[0] === "string"
      ? body.errors[0]
      : null,
    Array.isArray(body.errors) && body.errors[0]?.message,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
};

/** Message for UI (StatusModal, alerts) from a caught request error. */
export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (!error) return fallback;
  if (typeof error === "string" && error.trim()) return error.trim();
  const msg = error?.message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  return fallback;
};
