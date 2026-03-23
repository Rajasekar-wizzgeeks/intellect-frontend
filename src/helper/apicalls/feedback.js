import { feedbackExcelUrl } from "../apiurls";

const parseSSEStream = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = {};
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;

      const data = trimmed.replace("data: ", "");
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        if (json.error) {
          throw new Error(json.error);
        }

        if (json.type && json.data !== undefined) {
          result[json.type] = json.data;
        } else {
          // Merge other fields if any
          Object.assign(result, json);
        }
      } catch (e) {
        console.error("Error parsing SSE chunk:", e, data);
      }
    }
  }
  return result;
};

export const excelSheetFeedback = async (fileOrFiles) => {
  try {
    const files = Array.isArray(fileOrFiles)
      ? fileOrFiles.filter(Boolean)
      : [fileOrFiles].filter(Boolean);

    const formData = new FormData();
    for (const f of files) formData.append("files", f);

    const fetchOptions = {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
      },
      body: formData,
    };

    const [baseRes, contRes, stopRes] = await Promise.all([
      fetch(`${feedbackExcelUrl}/base`, fetchOptions),
      fetch(`${feedbackExcelUrl}/continue`, fetchOptions),
      fetch(`${feedbackExcelUrl}/stop`, fetchOptions),
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
      parseSSEStream(baseRes),
      parseSSEStream(contRes),
      parseSSEStream(stopRes),
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
