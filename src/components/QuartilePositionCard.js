import React, { useMemo, useState } from "react";
import "../styles/quartilePositionCard.scss";

const SELECTED_CACHE = new Map();

const headers5 = [
  "Score",
  "First quartile (25th percentile)",
  "Median value (50th percentile)",
  "Third quartile (75th percentile)",
  "Max Score",
];

const QUARTILE_LABELS = {
  1: "First Quartile",
  2: "Second Quartile",
  3: "Third Quartile",
  4: "Fourth Quartile",
};

const QuartilePositionCard = ({
  title,
  valuesByQuartile,
  initialSelected = 2,
  headers = headers5,
  onValueChange,
  persistKey,
}) => {
  const cacheKey = persistKey ?? title;
  const [selected, setSelected] = useState(() => {
    if (cacheKey && SELECTED_CACHE.has(cacheKey)) {
      return SELECTED_CACHE.get(cacheKey);
    }
    return initialSelected;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState({
    quartile: null,
    index: null,
  });

  const values = useMemo(() => {
    return valuesByQuartile?.[selected] || [];
  }, [valuesByQuartile, selected]);

  const handleSelect = (q) => {
    setSelected(q);
    if (cacheKey) SELECTED_CACHE.set(cacheKey, q);
    setCurrentEdit({ quartile: null, index: null });
    setIsEditing(false);
  };

  const handleValueClick = (quartile, index, value) => {
    setCurrentEdit({ quartile, index });
    setEditValue(value);
    setIsEditing(true);
  };

  const handleValueChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleValueBlur = () => {
    if (
      onValueChange &&
      currentEdit.quartile !== null &&
      currentEdit.index !== null
    ) {
      onValueChange(currentEdit.quartile, currentEdit.index, editValue);
    }
    setIsEditing(false);
    setCurrentEdit({ quartile: null, index: null });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  return (
    <div className="qpc">
      <div className="qpc-title">{title}</div>

      {/* Tabs 1-4 */}
      <div role="tablist" aria-label="Quartile tabs" className="qpc-tabs">
        {[1, 2, 3, 4].map((q) => (
          <button
            key={q}
            role="tab"
            aria-selected={selected === q}
            onClick={() => handleSelect(q)}
            className={`qpc-tab ${selected === q ? "qpc-tab--active" : ""}`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Quartile band chip */}
      <div className="qpc-chip-wrap">
        <span className="qpc-chip">{QUARTILE_LABELS[selected]}</span>
      </div>

      {/* Values table - 5 columns to match headers */}
      <div className="qpc-table-wrap">
        <table role="table" className="qpc-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={`h-${i}`} scope="col" className="qpc-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {values.map((value, i) => (
                <td
                  key={`v-${i}`}
                  className={`qpc-td ${i === 0 ? "qpc-td--left" : ""} ${
                    currentEdit.quartile === selected && currentEdit.index === i
                      ? "editing"
                      : ""
                  }`}
                  onClick={() => handleValueClick(selected, i, value)}
                >
                  {currentEdit.quartile === selected &&
                  currentEdit.index === i ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleValueChange}
                      onBlur={handleValueBlur}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      className="qpc-input"
                    />
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuartilePositionCard;
