import Cookies from "js-cookie";
import { clearLoginSession } from "./session";

let logoutInProgress = false;

export const forceLogout = () => {
  if (logoutInProgress) return;
  logoutInProgress = true;

  clearLoginSession();

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const apiFetch = async (url, options = {}) => {
  const { skipAuth = false, headers: inputHeaders, ...rest } = options;
  const headers = new Headers(inputHeaders || {});

  if (!skipAuth) {
    const token = Cookies.get("token");
    if (token) {
      headers.set("Authorization", token);
    }
  }

  const response = await fetch(url, { ...rest, headers });

  if (response.status === 401 && !skipAuth) {
    forceLogout();
    throw new Error("Unauthorized");
  }

  return response;
};
