import React, { useMemo } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import DavCommonHeader from "./DavCommonHeader";
import "../styles/headlinesPage.scss";

export default function Headlines() {
  const blocks = useMemo(() => {
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
          <tr>
            <td className="headlines-label-cell">Team/Staff Perception</td>
            <td className="headlines-data-cell">
              <ul className="headlines-list">
                <li>Visits classrooms to observe &amp; monitor the quality of curriculum, assessments &amp; instruction [Avg : 4.47]</li>
                <li>Works with teachers to set high academic standards [Avg : 4.44]</li>
                <li>Provides support, direction &amp; guidance for effective performance of team members [Avg : 4.44]</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td className="headlines-label-cell">Management Perception</td>
            <td className="headlines-data-cell">
              <ul className="headlines-list">
                <li>Manages School finances appropriately [Avg : 4.6]</li>
                <li>Does not misuse power and authority [Avg : 4.1]</li>
              </ul>
            </td>
          </tr>
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
          <tr>
            <td className="headlines-label-cell">Team/Staff Perception</td>
            <td className="headlines-data-cell">
              <ul className="headlines-list">
                <li>Values diverse perspectives [Avg : 4.16]</li>
                <li>Makes the team members feel empowered to take decisions [Avg : 4.19]</li>
                <li>Has created a work culture that rewards merit [Avg : 4.2]</li>
              </ul>
            </td>
          </tr>
          <tr>
            <td className="headlines-label-cell">Management Perception</td>
            <td className="headlines-data-cell">
              <ul className="headlines-list">
                <li>Develops future leaders [Avg : 3.2]</li>
                <li>Handles ambiguity [Avg : 3.4]</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>,
      <hr key="divider" className="headlines-divider" />,
      <div key="principals" className="headlines-principals">
        <div className="headlines-principals-heading">
          <span className="headlines-bullet">▪</span>
          <span>Principals who have rated themselves 5 in most questions :</span>
        </div>
        <ul className="headlines-principals-list">
          <li>
            <strong>Smt. Hemamala Balasubramanian and Thiru. Veeramurugan G</strong> (Rating 5 for 21 out of 24 questions),
          </li>
          <li>
            <strong>Smt. Bhuvaneshwari G and Thiru. Ramana Velavan Venkatachalam</strong> (Rating 5 for 20 out of 24 questions)
          </li>
        </ul>
      </div>,
    ];
  }, []);

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
