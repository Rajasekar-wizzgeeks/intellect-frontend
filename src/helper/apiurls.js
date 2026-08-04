const BASEURL = process.env.REACT_APP_BASE_URL || "";
// const BASEURL = "http://localhost:6103";

export const feedbackExcelUrl = `${BASEURL}/api/feedback/excel`;

export const lbscore360ExcelUrl = `${BASEURL}/api/lbscore360/excel`;

export const  dav360SummaryExcelUrl = `${BASEURL}/api/feedback/summary/base`;

export const savedDraftUrl = `${BASEURL}/api/user/feedback-draft/create`;

export const loginUrl = `${BASEURL}/api/user/login`;

export const getFeedbackDraftUrl = `${BASEURL}/api/user/feedback-draft/get`;

export const getOneFeedbackDraftUrl = `${BASEURL}/api/user/feedback-draft/getOne`;

export const updateFeedbackDraftUrl = `${BASEURL}/api/user/feedback-draft/update`;

export const getAllUsersUrl = `${BASEURL}/api/user/all`;

export const giveAccessUrl = `${BASEURL}/api/user/feedback-draft/giveAccess`;

export const deleteFeedbackDraftUrl = `${BASEURL}/api/user/feedback-draft/delete`;

export const logoutUrl = `${BASEURL}/api/user/logout`;

export const createUser = `${BASEURL}/api/user/create`

export const getUsers =`${BASEURL}/api/user/all`

export const multisave = `${BASEURL}/api/user/feedback-draft/multi-save`
export const categoryConfigsUrl = `${BASEURL}/api/lbscore360/categories`;