import Cookies from "js-cookie";
import { apiFetch } from "../apiFetch";
import { parseApiErrorBody } from "../getApiErrorMessage";
import { clearLoginSession } from "../session";
import { loginUrl, logoutUrl } from "../apiurls";

export { clearLoginSession } from "../session";

const LOGIN_EXCLUDE_KEYS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "message",
  "success",
  "status",
  "error",
  "user",
  "User",
  "userDetails",
  "user_details",
  "data",
]);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** Pull full user profile from login API response (handles nested / flat shapes). */
export const extractUserFromLoginResponse = (data, fallbackEmail = "") => {
  if (!isPlainObject(data)) return null;

  const root = isPlainObject(data.data) ? data.data : data;
  const nested =
    root.user ?? root.User ?? root.userDetails ?? root.user_details ?? null;

  let user = {};

  if (nested != null) {
    if (isPlainObject(nested)) {
      user = { ...nested };
    } else {
      user.id = nested;
    }
  }

  Object.entries(root).forEach(([key, value]) => {
    if (LOGIN_EXCLUDE_KEYS.has(key)) return;
    if (value === null || value === undefined) return;
    if (typeof value === "object") return;
    user[key] = value;
  });

  if (isPlainObject(data) && data !== root) {
    Object.entries(data).forEach(([key, value]) => {
      if (LOGIN_EXCLUDE_KEYS.has(key)) return;
      if (value === null || value === undefined) return;
      if (typeof value === "object") return;
      if (user[key] === undefined) user[key] = value;
    });
  }

  const email = user.email || fallbackEmail;
  if (email) user.email = email;

  return Object.keys(user).length ? user : null;
};

export const storeLoginSession = (data, fallbackEmail = "") => {
  const cookieOptions = { expires: 7, secure: true, sameSite: "strict" };

  const root = isPlainObject(data?.data) ? data.data : data;
  const token =
    data?.token ??
    data?.access_token ??
    root?.token ??
    root?.access_token;

  if (token) {
    Cookies.set("token", token, cookieOptions);
  }

  const user = extractUserFromLoginResponse(data, fallbackEmail);
  if (user) {
    Cookies.set("user", JSON.stringify(user), cookieOptions);
  }
};

export const logoutUser = async () => {
  try {
    const token = Cookies.get("token");
    if (token) {
      const response = await apiFetch(logoutUrl, { method: "POST" });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(parseApiErrorBody(errorData) || "Logout request failed");
      }
    }
  } catch (error) {
    if (error?.message !== "Unauthorized") {
      console.error("Logout API error:", error);
    }
  } finally {
    clearLoginSession();
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiFetch(loginUrl, {
      method: "POST",
      skipAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseApiErrorBody(errorData) || "Login failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const createUserApi = async ({ email, password, role }) => {
  const { parseApiErrorBody } = await import("../getApiErrorMessage");
  const { apiFetch } = await import("../apiFetch");
  const { createUser } = await import("../apiurls");

  const response = await apiFetch(createUser, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(parseApiErrorBody(errorData) || "Failed to create user");
  }

  return await response.json();
};
