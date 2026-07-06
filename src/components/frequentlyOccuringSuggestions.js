import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import DavCommonHeader from "./DavCommonHeader";
import "../styles/frequentlyOccuringSuggestions.scss";

const FrequentlyOccuringSuggestions = ({
  data,
  title = "Frequently Occurring Suggestions/ Concerns",
}) => {
  const teamData = useMemo(() => {
    if (data?.team_feedback && Array.isArray(data.team_feedback)) {
      return data.team_feedback.map(item => ({
        action: item.theme,
        people: item.employees || []
      }));
    }
    return [
      {
        action:
          "Avoiding getting angry in public and giving negative feedback in private",
        people: [
          "Ms. Kanakalakshmi S",
          "Ms. Nandhini Srinivasan",
          "Ms. Uma Parvathy",
          "Mr. Veeramurugan G",
          "Mr. T. Rangarajan",
        ],
      },
      {
        action:
          "Broader allocation & even distribution of work amongst more teachers rather than confining to a few",
        people: [
          "Ms. Kanakalakshmi S",
          "Ms. Sindhu S",
          "Ms. Uma Parvathy",
          "Ms. Swarna Karpagavalli S",
        ],
      },
      {
        action: "Appreciating and taking into account diverse viewpoints",
        people: [
          "Ms. Bhuvaneshwari G",
          "Ms. Uma Parvathy",
          "Mr. Veeramurugan G",
        ],
      },
      {
        action: "Cultivating a calm & composed communication style",
        people: [
          "Ms. Nandhini Srinivasan",
          "Mr. Veeramurugan G",
          "Mr. T. Rangarajan",
        ],
      },
      {
        action: "Conducting focused & time efficient meetings",
        people: ["Ms. Swarna Karpagavalli S", "Mr. Veeramurugan G"],
      },
      {
        action: "Minimizing wait time for teachers to meet the Principal",
        people: ["Ms. Nandhini Srinivasan", "Ms. Swarna Karpagavalli S"],
      },
    ];
  }, [data]);

  const managerDataList = useMemo(() => {
    if (data?.manager_feedback && Array.isArray(data.manager_feedback)) {
      return data.manager_feedback.map(item => ({
        action: item.theme,
        people: item.employees || []
      }));
    }
    return [
      {
        action:
          "Developing future leaders within the school (Average – 3.2 : Lowest average)",
        people: [
          "Ms. Kanakalakshmi S",
          "Ms. Sindhu S",
          "Mr. Ramana Velavan",
          "Mr. T. Rangarajan",
          "Ms. Swarna Karpagavalli S",
          "Mr. Veeramurugan G",
          "Ms. Bhuvaneshwari G",
          "Ms. Uma Parvathy",
        ],
      },
    ];
  }, [data]);

  const blocks = useMemo(() => {
    return [
      <div key="fos-header">
        <DavCommonHeader title={title} />
      </div>,
      <div key="fos-grid" className="fos-grid">
        {/* LEFT */}
        <div className="fos-col">
          <div className="fos-col__title">Team Feedback</div>

          <div className="fos-table">
            <div className="fos-row fos-row--head">
              <div>Action Items</div>
              <div>Feedback Given For</div>
            </div>

            {teamData.map((item, idx) => (
              <div key={idx} className="fos-row">
                <div className="fos-action">{item.action}</div>

                <div className="fos-feedback">
                  {(item.people || []).map((p, i) => (
                    <div key={i}>▪ {p}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="fos-col">
          <div className="fos-col__title">Manager Perception</div>

          <div className="fos-table">
            <div className="fos-row fos-row--head">
              <div>Action Items</div>
              <div>Feedback Given For</div>
            </div>

            {managerDataList.map((item, idx) => (
              <div key={idx} className="fos-row">
                <div className="fos-action">{item.action}</div>
                <div className="fos-feedback">
                  {(item.people || []).map((p, i) => (
                    <div key={i}>▪ {p}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>,
    ];
  }, [managerDataList, teamData, title]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="fos-page"
      pageClassName="dav360-page"
      componentId="frequently-occuring-suggestions"
    />
  );
};

export default FrequentlyOccuringSuggestions;