import { apiFetch } from "../apiFetch";
import { parseApiErrorBody } from "../getApiErrorMessage";
import { feedbackExcelUrl, lbscore360ExcelUrl, dav360SummaryExcelUrl, savedDraftUrl, getFeedbackDraftUrl, getOneFeedbackDraftUrl, updateFeedbackDraftUrl, getAllUsersUrl, giveAccessUrl, deleteFeedbackDraftUrl, multisave } from "../apiurls";

const apiRequestError = (errorData, fallback) =>
  new Error(parseApiErrorBody(errorData) || fallback);

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
          
          if (json.error || json.type === "error") {
            throw new Error(json.error || "Unknown error");
          }

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

            case "summary_by_competency_for_the_institution":
              result.summary_by_competency_for_the_institution = json.summary_by_competency_for_the_institution || json.data;
              break;

            case "institution_competency_summary":
              result.institution_competency_summary = json.institution_competency_summary || json.data;
              break;

            case "summary_framework_recap":
              result.summary_framework_recap = json.summary_framework_recap || json.data;
              break;

            case "overall_principal_averages":
              result.overall_principal_averages = json.overall_principal_averages || json.data;
              break;

            case "leadership_profile_data":
              result.leadership_profile_data = json.leadership_profile_data || json.data;
              break;

            case "headlines":
              result.headlines = json.headlines || json.data;
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
      apiFetch(`${feedbackExcelUrl}/base`, fetchOptions),
      apiFetch(`${feedbackExcelUrl}/continue`, fetchOptions),
      apiFetch(`${feedbackExcelUrl}/stop`, fetchOptions),
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

export const saveDraft = async (payload) => {
  try {
    const response = await apiFetch(savedDraftUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to save draft");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving draft:", error);
    throw error;
  }
};

export const updateFeedbackDraft = async (payload) => {
  try {
    const response = await apiFetch(updateFeedbackDraftUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to update draft");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating draft:", error);
    throw error;
  }
};


export const excelSheetLbScore360Multi = async (file, onRecipient) => {
  const formData = new FormData();
  formData.append("files", file);

  const res = await apiFetch(`${lbscore360ExcelUrl}/base`, {
    method: "POST",
    headers: { Accept: "text/event-stream" },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LBSCORE360 failed: ${res.status} ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const recipients = [];
  let competencySummary = null;
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

        const raw = trimmed.slice("data: ".length);
        if (raw === "[DONE]") {
          return { recipients, competencySummary };
        }

        try {
          const json = JSON.parse(raw);

          if (json.error || json.type === "error") {
            throw new Error(json.error || "Unknown stream error");
          }

          if (json.type === "recipient_data") {
            // Each recipient_data event is a complete recipient object
            const recipient = json.data || json;
            recipients.push(recipient);
            if (onRecipient) onRecipient(recipient);

          } else if (json.type === "competency_summary") {
            // Last event — common data shared across all recipients
            competencySummary = json.data || json;

          } else {
            const payload = json.data || json;
            const looksLikeRecipient =
              payload &&
              typeof payload === "object" &&
              (payload.feedbacks ||
                payload.overall_behavioural_indications ||
                payload.behavioural_indications ||
                payload.introduction ||
                payload.profile);
            if (looksLikeRecipient) {
              recipients.push(payload);
              if (onRecipient) onRecipient(payload);
            }
          }
        } catch (e) {
          console.error("Error parsing SSE chunk:", e, raw);
        }
      }
    }
  } catch (e) {
    console.error("Stream reading error:", e);
    if (recipients.length > 0) return { recipients, competencySummary };
    throw e;
  }

  return { recipients, competencySummary };
};

export const excelSheetLbScore360 = async (fileOrFiles) => {
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

    const res = await apiFetch(`${lbscore360ExcelUrl}/base`, fetchOptions);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`LBSCORE360 failed: ${res.status} ${text}`);
    }

    const data = await parseSSEStream(res).catch((e) => {
      console.error("LBSCORE360 stream error:", e);
      if (e.message.includes("network error") || e.message.includes("Reader has been released")) {
         return {}; 
      }
      throw new Error(`LBSCORE360 stream failed: ${e.message}`);
    });

    return data;
  } catch (error) {
    console.error("Error fetching lbscore360 data:", error);
    throw error;
  }
};

export const excelSheetDav360Summary = async (fileOrFiles) => {
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

    const res = await apiFetch(dav360SummaryExcelUrl, fetchOptions);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`DAV360SUMMARY failed: ${res.status} ${text}`);
    }

    const data = await parseSSEStream(res).catch((e) => {
      console.error("DAV360SUMMARY stream error:", e);
      if (e.message.includes("network error") || e.message.includes("Reader has been released")) {
         return {}; 
      }
      throw new Error(`DAV360SUMMARY stream failed: ${e.message}`);
    });

    return data;
  } catch (error) {
    console.error("Error fetching dav360 summary data:", error);
    throw error;
  }
};

export const getFeedbackDrafts = async () => {
  try {
    const response = await apiFetch(getFeedbackDraftUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to fetch drafts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching drafts:", error);
    throw error;
  }
};

export const getOneFeedbackDraft = async (draftId) => {
  try {
    const response = await apiFetch(
      `${getOneFeedbackDraftUrl}?feedback_draft_id=${draftId}`,
      { method: "GET" },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to fetch draft");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching draft:", error);
    throw error;
  }
};

export const deleteFeedbackDraft = async (draftId) => {
  try {
    const response = await apiFetch(
      `${deleteFeedbackDraftUrl}?feedback_draft_id=${draftId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to delete draft");
    }

    return await response.json().catch(() => ({}));
  } catch (error) {
    console.error("Error deleting draft:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiFetch(getAllUsersUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const giveAccess = async (payload) => {
  try {
    const response = await apiFetch(giveAccessUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to give access");
    }

    return await response.json();
  } catch (error) {
    console.error("Error giving access:", error);
    throw error;
  }
};

export const multiSaveDraft = async (payload) => {
  try {
    const response = await apiFetch(multisave, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw apiRequestError(errorData, "Failed to multi-save draft");
    }

    return await response.json();
  } catch (error) {
    console.error("Error multi-saving draft:", error);
    throw error;
  }
};
