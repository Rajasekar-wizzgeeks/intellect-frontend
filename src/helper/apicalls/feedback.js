import { feedbackExcelUrl } from "../apiurls";

export const excelSheetFeedback = async (fileOrFiles) => {
  try {
    const form = new FormData();
    if (Array.isArray(fileOrFiles)) {
      fileOrFiles.filter(Boolean).forEach((f) => form.append("files", f));
    } else {
      form.append("files", fileOrFiles);
    }
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
