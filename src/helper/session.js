import Cookies from "js-cookie";

export const clearLoginSession = () => {
  Cookies.remove("token");
  Cookies.remove("user");
};
