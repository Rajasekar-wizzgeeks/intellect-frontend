import { feedbackExcelUrl } from "../apiurls";

const parseSSEStream = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = {};
  let buffer = "";

  try {
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
        if (data === "[DONE]") {
          return result;
        }

        try {
          const json = JSON.parse(data);
          
          // 1) error handling
          if (json.error || json.type === "error") {
            throw new Error(json.error || "Unknown error");
          }

          // 2) Mapping logic based on type
          switch (json.type) {
            case "meta":
              result.name = json.name || json.data?.name;
              result.date= json.date || json?.data?.date;
              break;

            case "comparision_average":
              result.comparision_average =
                json.comparision_average || json.data?.comparision_average || json.data;

              if (json.manager_comparision_average !== undefined || json.data?.manager_comparision_average !== undefined) {
                result.manager_comparision_average =
                  json.manager_comparision_average || json.data?.manager_comparision_average;
              }
              break;

            case "manager_comparision_average":
              result.manager_comparision_average =
                json.manager_comparision_average || json.data?.manager_comparision_average || json.data;

              if (json.comparision_average !== undefined || json.data?.comparision_average !== undefined) {
                result.comparision_average =
                  json.comparision_average || json.data?.comparision_average;
              }
              break;

            case "total_response":
              result.total_response = json.total_response || json.data?.total_response || json.data;
              break;

            case "competencies":
              Object.assign(result, {
                competency_summary_overall: json.competency_summary_overall || json.data?.competency_summary_overall || json.summary,
                right_culture_competency: json.right_culture_competency || json.data?.right_culture_competency || json.details?.right_culture,
                leadership_style_competency: json.leadership_style_competency || json.data?.leadership_style_competency || json.details?.leadership_style,
                leadership_staff_dev_competency: json.leadership_staff_dev_competency || json.data?.leadership_staff_dev_competency || json.details?.leadership_staff_dev,
                educational_quality_competency: json.educational_quality_competency || json.data?.educational_quality_competency || json.details?.educational_quality,
                engagement_with_management_competency: json.engagement_with_management_competency || json.data?.engagement_with_management_competency || json.details?.engagement_with_management,
              });
              break;

            case "strengths_area_of_improvement":
              result.strengths = json.data?.strengths;
              result.area_of_improvement = json.data?.area_of_improvement;
              break;

            case "nominee_leadership":
              result.nominee_leadership = json.nominee_leadership || json.data?.nominee_leadership || json.data;
              break;

            case "workplace_culture":
              result.workplace_culture = json.workplace_culture || json.data?.workplace_culture || json.data;
              break;

            case "predominant_leader_most_thing":
              result.predominant_leader_most_thing = json.predominant_leader_most_thing || json.data?.predominant_leader_most_thing || json.data;
              break;

            case "predominant_leader_thing":
              result.predominant_leader_thing = json.predominant_leader_thing || json.data?.predominant_leader_thing || json.data;
              break;

            case "action_areas_thing":
              result.action_areas_thing = json.action_areas_thing || json.data?.action_areas_thing || json.data;
              break;

            case "continue_doing_thing":
              result.continue_doing_thing = json.data;
              break;

            case "stop_doing_thing":
              result.stop_doing_thing = json.data;
              break;

            default:
              // Fallback for types not explicitly handled
              if (json.type && json.data !== undefined) {
                result[json.type] = json.data;
              } else {
                Object.assign(result, json);
              }
              break;
          }
        } catch (e) {
          console.error("Error parsing SSE chunk:", e, data);
        }
      }
    }
  } catch (e) {
    console.error("Stream reading error:", e);
    // If we have some data, return it instead of throwing "network error"
    if (Object.keys(result).length > 0) {
      return result;
    }
    throw e;
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
      parseSSEStream(baseRes).catch((e) => {
        console.error("BASE stream error:", e);
        if (e.message.includes("network error") || e.message.includes("Reader has been released")) {
           return {}; 
        }
        throw new Error(`BASE stream failed: ${e.message}`);
      }),
      parseSSEStream(contRes).catch((e) => {
        console.error("CONTINUE stream error:", e);
        if (e.message.includes("network error") || e.message.includes("Reader has been released")) {
           return {};
        }
        throw new Error(`CONTINUE stream failed: ${e.message}`);
      }),
      parseSSEStream(stopRes).catch((e) => {
        console.error("STOP stream error:", e);
        if (e.message.includes("network error") || e.message.includes("Reader has been released")) {
           return {};
        }
        throw new Error(`STOP stream failed: ${e.message}`);
      }),
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
