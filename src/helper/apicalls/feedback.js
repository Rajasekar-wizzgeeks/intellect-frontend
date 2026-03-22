import { feedbackExcelUrl } from "../apiurls";

export const excelSheetFeedback = async (fileOrFiles) => {
  try {
    const files = Array.isArray(fileOrFiles)
      ? fileOrFiles.filter(Boolean)
      : [fileOrFiles].filter(Boolean);

    const formData = new FormData();
    for (const f of files) formData.append("files", f);

    const [baseRes, contRes, stopRes] = await Promise.all([
      fetch(`${feedbackExcelUrl}/base`, {
        method: "POST",
        body: formData,
      }),
      fetch(`${feedbackExcelUrl}/continue`, {
        method: "POST",
        body: formData,
      }),
      fetch(`${feedbackExcelUrl}/stop`, {
        method: "POST",
        body: formData,
      }),
    ]);

    if (!baseRes.ok) {
      const text = await baseRes.text().catch(() => "");
      throw new Error(`BASE failed: ${baseRes.status} ${text}`);
    }
    if (!contRes.ok) {
      const text = await contRes.text().catch(() => "");
      throw new Error(`CONTINUE failed: ${contRes.status} ${text}`);
    }
    if (!stopRes.ok) {
      const text = await stopRes.text().catch(() => "");
      throw new Error(`STOP failed: ${stopRes.status} ${text}`);
    }

    const [base, cont, stop] = await Promise.all([
      baseRes.json().catch(() => ({})),
      contRes.json().catch(() => ({})),
      stopRes.json().catch(() => ({})),
    ]);

    return {
      ...base,
      ...cont,
      ...stop,
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};
