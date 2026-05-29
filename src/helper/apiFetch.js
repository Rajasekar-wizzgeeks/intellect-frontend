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
  const { skipAuth = false, headers: inputHeaders, includeContentLength = false, ...rest } = options;
  const headers = new Headers(inputHeaders || {});

  if (!skipAuth) {
    const token = Cookies.get("token");
    if (token) {
      headers.set("Authorization", token);
    }
  }

  if (includeContentLength && rest.body) {
    let contentLength = 0;
    
    if (typeof rest.body === 'string') {
      contentLength = new Blob([rest.body]).size;
    } else if (rest.body instanceof FormData) {
      // For FormData, we need to calculate the size
      const blob = await new Response(rest.body).blob();
      contentLength = blob.size;
    } else if (rest.body instanceof Blob) {
      contentLength = rest.body.size;
    }
    
    if (contentLength > 0) {
      headers.set("Content-Length", contentLength.toString());
    }
  }

  const response = await fetch(url, { ...rest, headers });

  if (response.status === 401 && !skipAuth) {
    forceLogout();
    throw new Error("Unauthorized");
  }

  return response;
};
