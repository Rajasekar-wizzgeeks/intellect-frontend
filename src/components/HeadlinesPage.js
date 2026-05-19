import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import DavCommonHeader from "./DavCommonHeader";
import "../styles/headlinesPage.scss";

export default function Headlines({ headlines, highestRows, lowestRows, notes }) {
  const blocks = useMemo(() => {
    let safeHighestRows = Array.isArray(highestRows) ? highestRows : [];
    let safeLowestRows = Array.isArray(lowestRows) ? lowestRows : [];
    const safeNotes = Array.isArray(notes) ? notes : [];

    const headlinesData = headlines?.headlines || headlines;
    if (headlinesData && (headlinesData.hightest_team_avg || headlinesData.lowest_team_avg || headlinesData.hightest_manager_avg || headlinesData.lowest_manager_avg)) {
      const formatItem = ([text, scores], isTeam) => {
        const avg = isTeam ? scores?.Subordinates : scores?.Manager;
        return `${text} [Avg : ${avg !== undefined && avg !== null ? avg : 0}]`;
      };

      safeHighestRows = [
        {
          label: "Team/Staff Perception",
          items: (headlinesData.hightest_team_avg || []).map((item) => formatItem(item, true)),
        },
        {
          label: "Management Perception",
          items: (headlinesData.hightest_manager_avg || []).map((item) => formatItem(item, false)),
        },
      ];

      safeLowestRows = [
        {
          label: "Team/Staff Perception",
          items: (headlinesData.lowest_team_avg || []).map((item) => formatItem(item, true)),
        },
        {
          label: "Management Perception",
          items: (headlinesData.lowest_manager_avg || []).map((item) => formatItem(item, false)),
        },
      ];
    }

    return [
      <div key="headlines-header">
        <DavCommonHeader title="Headlines" />
      </div>,
      <div key="headlines-section-1" className="headlines-section">
        <span className="headlines-bullet">▪</span>
        <span className="headlines-section-title">Highest &amp; Lowest Institutional Averages</span>
      </div>,
      <table key="table-green" className="headlines-table headlines-table--green">
        <colgroup>
          <col style={{ width: "180px" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className="headlines-empty-cell" />
            <td className="headlines-header-cell">Highest Institutional Averages</td>
          </tr>
          {safeHighestRows.map((row, idx) => (
            <tr key={`high-${idx}`}>
              <td className="headlines-label-cell">{row.group || row.label}</td>
              <td className="headlines-data-cell">
                <ul className="headlines-list">
                  {(row.items || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>,
      <table key="table-peach" className="headlines-table headlines-table--peach">
        <colgroup>
          <col style={{ width: "180px" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className="headlines-empty-cell" />
            <td className="headlines-header-cell">Lowest Institutional Averages</td>
          </tr>
          {safeLowestRows.map((row, idx) => (
            <tr key={`low-${idx}`}>
              <td className="headlines-label-cell">{row.group || row.label}</td>
              <td className="headlines-data-cell">
                <ul className="headlines-list">
                  {(row.items || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>,
      <hr key="divider" className="headlines-divider" />,
      <div key="principals" className="headlines-principals">
        <div className="headlines-principals-heading">
          <span className="headlines-bullet">▪</span>
          <span>Principals who have rated themselves 5 in most questions :</span>
        </div>
        <ul className="headlines-principals-list">
          {safeNotes.map((note, idx) => (
            <li key={idx}>
              {typeof note === "string" ? (
                note
              ) : (
                <strong>{note.text}</strong>
              )}
            </li>
          ))}
        </ul>
      </div>,
    ];
  }, [headlines, highestRows, lowestRows, notes]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={894}
      pageHeight={1123}
      pagePadding={40}
      contentClassName="headlines"
      pageClassName="dav360-page"
      componentId="headlines"
    />
  );
}
