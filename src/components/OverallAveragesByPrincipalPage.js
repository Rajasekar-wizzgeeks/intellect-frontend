import "../styles/overallAveragesByPrincipalPage.scss";

const MAX = 5;

const teamRows = [
  { name: "Mr. Ramana Velavan Venkatachalam", responses: 43, value: 4.65 },
  { name: "Ms. Bhuvaneshwari G", responses: 36, value: 4.54 },
  { name: "Ms. Kanakalakshmi S", responses: 151, value: 4.4 },
  { name: "Ms. Nandhini Srinivasan", responses: 96, value: 4.3 },
  { name: "Ms. Swarna Karpagavalli S", responses: 93, value: 4.26 },
  { name: "Ms. Sindhu S", responses: 92, value: 4.26 },
  { name: "Ms. Hemamala Balasubramanian", responses: 22, value: 4.26 },
  { name: "Ms. Uma Parvathy", responses: 66, value: 4.25 },
  { name: "Mr. Veeramurugan G", responses: 77, value: 4.16 },
  { name: "Mr. T. Rangarajan", responses: 33, value: 4.04 },
];

const managerRows = [
  { name: "Ms. Kanakalakshmi S", value: 4.38 },
  { name: "Ms. Sindhu S", value: 4.38 },
  { name: "Ms. Hemamala Balasubramanian", value: 3.85 },
  { name: "Mr. Ramana Velavan...", value: 3.77 },
  { name: "Mr. T. Rangarajan", value: 3.69 },
  { name: "Mr. Veeramurugan G", value: 3.54 },
  { name: "Ms. Swarna Karpagavalli S", value: 3.54 },
  { name: "Ms. Nandhini Srinivasan", value: 3.54 },
  { name: "Ms. Bhuvaneshwari G", value: 3.38 },
  { name: "Ms. Uma Parvathy", value: 2.92 },
];

const fmt = (v) => v.toFixed(2);

const Bar = ({ row, color, showResponses }) => {
  const widthPct = (row.value / MAX) * 100;
  return (
    <div className="oap__row">
      <div className="oap__name">{row.name}</div>
      <div className="oap__bar-wrap">
        <div className={`oap__bar oap__bar--${color}`} style={{ width: `${widthPct}%` }}>
          {showResponses && row.responses != null && (
            <span className="oap__responses">{row.responses} responses</span>
          )}
        </div>
        <span className="oap__value">{fmt(row.value)}</span>
      </div>
    </div>
  );
};

const OverallAveragesByPrincipalPage = () => {
  return (
    <div className="oap-page">
      <div className="oap">
        <h2 className="oap__title">Overall Averages By Principal</h2>

        <div className="oap__headers">
          <div className="oap__header">Team</div>
          <div className="oap__header-divider" />
          <div className="oap__header">Manager</div>
        </div>

        <div className="oap__legend-row">
          <div className="oap__legend">
            <span className="oap__legend-square oap__legend-square--green" />
            <span className="oap__legend-text">Group Mean (Teachers &amp; Office Staff)</span>
          </div>
          <div className="oap__legend-spacer" />
          <div className="oap__legend">
            <span className="oap__legend-square oap__legend-square--red" />
            <span className="oap__legend-text">Manager Rating</span>
          </div>
        </div>

        <div className="oap__columns">
          <div className="oap__col">
            {teamRows.map((r) => (
              <Bar key={r.name} row={r} color="green" showResponses />
            ))}
          </div>

          <div className="oap__col-divider" />

          <div className="oap__col">
            {managerRows.map((r) => (
              <Bar key={r.name} row={r} color="red" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallAveragesByPrincipalPage;
