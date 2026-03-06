import { feedbackExcelUrl } from "../apiurls";

export const excelSheetFeedback = async (file) => {
  try {
    const form = new FormData();
    form.append("files", file);
    const response = await fetch(feedbackExcelUrl, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};
