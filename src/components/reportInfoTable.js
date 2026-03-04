import React from "react";
import "../styles/summaryTable.scss";

const defaultRows = [
  { label: "Associate Name", value: "Mr. Mike Stevenson" },
  { label: "Associate ID", value: "7AB" },
  { label: "Email ID", value: "mike.stevenson@intellectdesign.com" },
  { label: "Stream", value: "Project Management" },
  { label: "LOB", value: "CORP" },
  { label: "Report Date", value: "24-July-2025" },
  {
    label: "Assessed By",
    value: "Self, Manager(s), Peer(s) and Team Member(s)",
  },
];

/**
 * ReportInfoTable
 * Props:
 * - rows: Array<{label, value, [extraKey]?: string}>
 * - headers?: [leftHeader, rightHeader] | [leftHeader, midHeader, rightHeader]
 * - leftWidth?: CSS width for label column (default '36%')
 * - rightWidth?: CSS width for value column (default '64%')
 * - midWidth?: CSS width for optional middle column when using 3 cols (default '24%')
 * - rowHeight?: number (px) height for each row
 * - className?: string
 * - extraKey?: string (defaults to 'extra')
 */
const ReportInfoTable = ({
  rows = defaultRows,
  headers,
  leftWidth = "36%",
  rightWidth = "64%",
  midWidth = "24%",
  rowHeight,
  className = "",
  extraKey = "extra",
}) => {
  const hasThird = Array.isArray(headers) && headers.length === 3;

  const styleVars = {
    "--label-col": leftWidth,
    "--value-col": hasThird ? rightWidth : rightWidth,
    ...(hasThird ? { "--mid-col": midWidth } : {}),
    ...(rowHeight ? { "--row-h": `${rowHeight}px` } : {}),
  };

  return (
    <div className={`report-info ${className}`.trim()}>
      <table className="report-info__table" role="table" style={styleVars}>
        {headers && Array.isArray(headers) && headers.length >= 2 && (
          <thead>
            <tr className="report-info__row">
              <th
                className="report-info__cell report-info__cell--label report-info-header"
                scope="col"
              >
                {headers[0]}
              </th>
              <th
                className={`report-info__cell report-info-header ${
                  hasThird
                    ? "report-info__cell--mid"
                    : "report-info__cell--value"
                }`}
                scope="col"
              >
                {headers[1]}
              </th>
              {hasThird && (
                <th
                  className="report-info__cell report-info-header report-info__cell--value"
                  scope="col"
                >
                  {headers[2]}
                </th>
              )}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="report-info__row" role="row">
              <th
                scope="row"
                className="report-info__cell report-info__cell--label"
              >
                {r.label}
              </th>
              <td
                className={`report-info__cell ${
                  hasThird
                    ? "report-info__cell--mid"
                    : "report-info__cell--value"
                }`}
              >
                {r.value}
              </td>
              {hasThird && (
                <td className="report-info__cell report-info__cell--value">
                  {r[extraKey]}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportInfoTable;
