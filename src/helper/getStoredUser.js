import Cookies from "js-cookie";

export const getStoredUser = () => {
  try {
    const raw = Cookies.get("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};
