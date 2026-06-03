import React, { useEffect, useMemo, useState } from "react";
import "../styles/evaluatorTable.scss";

const EvaluatorRatingsTable = ({
  rows = [
    {
      label: "Self",
      score: 1,
      gapFromSelf: 0,
      highlight: "Area of Improvement",
      color: "#b3792e",
    },
    {
      label: "Manager",
      score: 3,
      gapFromSelf: 2,
      highlight: "Area of Improvement",
      color: "#b8860b",
    },
    {
      label: "Peer",
      score: 4,
      gapFromSelf: 3,
      highlight: "Hidden Strength",
      color: "#a9d0b8",
    },
    {
      label: "Team Members",
      score: 5,
      gapFromSelf: 4,
      highlight: "Hidden Strength",
      color: "#0e4a2e",
    },
  ],
  max = 5,
  title,
  compact = false,
  onDataChange,
}) => {
  const initialRows = useMemo(() => rows, [rows]);
  const [tableRows, setTableRows] = useState(initialRows);
  const [editValue, setEditValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState({ rowIndex: null });
  const [highlightEditValue, setHighlightEditValue] = useState("");
  const [currentHighlightEdit, setCurrentHighlightEdit] = useState({ rowIndex: null });

  useEffect(() => {
    setTableRows(initialRows);
  }, [initialRows]);

  const pct = (score) => `${Math.max(0, Math.min(1, score / max)) * 100}%`;
  const colorPicker = (value) => {
    if (value <= 3.5) {
      return "var(--color-gold)";
    } else if (value > 3.5 && value <= 4) {
      return "var(--color-mint)";
    } else if (value > 4) {
      return "var(--color-green-mid)";
    }
    return "#ffffff";
  };

  const handleScoreClick = (rowIndex, value) => {
    setCurrentEdit({ rowIndex });
    setEditValue(String(value ?? ""));
  };

  const handleScoreChange = (e) => {
    setEditValue(e.target.value);
  };

  const commitScoreEdit = () => {
    if (currentEdit.rowIndex === null) {
      setCurrentEdit({ rowIndex: null });
      return;
    }

    const next = [...tableRows];
    const row = next[currentEdit.rowIndex];
    if (row) {
      next[currentEdit.rowIndex] = {
        ...row,
        score: editValue,
      };
      setTableRows(next);
      if (onDataChange) {
        onDataChange(next);
      }
    }

    setCurrentEdit({ rowIndex: null });
  };

  const handleScoreBlur = () => {
    commitScoreEdit();
  };

  const handleScoreKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitScoreEdit();
    }
  };

  const handleHighlightClick = (rowIndex, value) => {
    setCurrentHighlightEdit({ rowIndex });
    setHighlightEditValue(String(value ?? ""));
  };

  const handleHighlightChange = (e) => {
    setHighlightEditValue(e.target.value);
  };

  const commitHighlightEdit = () => {
    if (currentHighlightEdit.rowIndex === null) {
      setCurrentHighlightEdit({ rowIndex: null });
      return;
    }

    const next = [...tableRows];
    const row = next[currentHighlightEdit.rowIndex];
    if (row) {
      next[currentHighlightEdit.rowIndex] = {
        ...row,
        highlight: highlightEditValue,
      };
      setTableRows(next);
      if (onDataChange) {
        onDataChange(next);
      }
    }

    setCurrentHighlightEdit({ rowIndex: null });
  };

  const handleHighlightBlur = () => {
    commitHighlightEdit();
  };

  const handleHighlightKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitHighlightEdit();
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <table
        className={`evaluator-table${
          compact ? " evaluator-table--compact" : ""
        }`}
        style={{ width: "100%" }}
      >
        {/* {title ? <caption className="et-caption">{title}</caption> : null} */}
        <thead>
          <tr>
            <th className="et-col-label"></th>
            <th className="et-col-na">NA</th>
            {Array.from({ length: max }).map((_, i) => (
              <th key={i} className="et-col-scale">
                {i + 1}
              </th>
            ))}
            <th className="et-col-score">Score</th>
            <th className="et-col-gap">Gap from Self</th>
            <th className="et-col-highlight">Highlight</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((r, idx) => (
            <tr key={idx}>
              <td className="et-label">{r.label}</td>
              <td className="et-na"></td>
              <td className="et-scale" colSpan={max}>
                <div className="et-track">
                  <div
                    className="et-bar"
                    style={{
                      width: pct(r.score),
                      background: colorPicker(r.score),
                    }}
                  />
                </div>
              </td>
              <td
                className={`et-score ${
                  currentEdit.rowIndex === idx ? "editing" : ""
                }`}
                onClick={() => handleScoreClick(idx, r.score)}
              >
                {currentEdit.rowIndex === idx ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleScoreChange}
                    onBlur={handleScoreBlur}
                    onKeyDown={handleScoreKeyDown}
                    autoFocus
                    className="et-input"
                  />
                ) : (
                  r.score
                )}
              </td>
              <td className="et-gap">{parseFloat(Math.abs(tableRows[0].score - r.score).toFixed(2))}</td>
              <td
                className={`et-highlight ${
                  currentHighlightEdit.rowIndex === idx ? "editing" : ""
                }`}
                onClick={() => handleHighlightClick(idx, r.highlight)}
              >
                {currentHighlightEdit.rowIndex === idx ? (
                  <input
                    type="text"
                    value={highlightEditValue}
                    onChange={handleHighlightChange}
                    onBlur={handleHighlightBlur}
                    onKeyDown={handleHighlightKeyDown}
                    autoFocus
                    className="et-input"
                  />
                ) : (
                  r.highlight
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EvaluatorRatingsTable;
