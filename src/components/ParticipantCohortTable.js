import React, { useEffect, useMemo, useState } from "react";
import "../styles/participantCohortTable.scss";

const ParticipantCohortTable = ({
  competencies = [
    "Leadership",
    "Bandwidth",
    "Sales and Customer Centricity",
    "Collaboration",
    "Results Orientation",
    "Expertise and Communication",
  ],
  selfRatings = {},
  cohortRatings = {},
  onSelfRatingsChange,
  onCohortRatingsChange,
}) => {
  const initialSelfRatings = useMemo(() => selfRatings, [selfRatings]);
  const initialCohortRatings = useMemo(() => cohortRatings, [cohortRatings]);
  const [localSelfRatings, setLocalSelfRatings] = useState(initialSelfRatings);
  const [localCohortRatings, setLocalCohortRatings] = useState(
    initialCohortRatings
  );
  const [editValue, setEditValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState({
    competencyIndex: null,
    rowKind: null,
    colKey: null,
  });

  useEffect(() => {
    setLocalSelfRatings(initialSelfRatings);
  }, [initialSelfRatings]);

  useEffect(() => {
    setLocalCohortRatings(initialCohortRatings);
  }, [initialCohortRatings]);

  const COLS = useMemo(
    () => [
      { key: "self", className: "pc-col-self" },
      { key: "manager", className: "pc-col-mgr" },
      { key: "teamMembers", className: "pc-col-team" },
      { key: "peers", className: "pc-col-peers" },
    ],
    []
  );

  const valueAt = (ratingsMap, competencyLabel, colKey) => {
    const row = ratingsMap?.[competencyLabel];
    if (row == null) return "";
    if (typeof row !== "object") return "";
    const direct = row[colKey];
    if (direct !== undefined && direct !== null) return direct;
    if (colKey === "teamMembers") {
      const alt = row.team || row.teamMember || row.team_members;
      if (alt !== undefined && alt !== null) return alt;
    }
    return "";
  };

  const startEdit = ({ competencyIndex, rowKind, colKey, value }) => {
    setCurrentEdit({ competencyIndex, rowKind, colKey });
    setEditValue(String(value ?? ""));
  };

  const commitEdit = () => {
    const { competencyIndex, rowKind, colKey } = currentEdit;
    if (competencyIndex === null || !rowKind || !colKey) {
      setCurrentEdit({ competencyIndex: null, rowKind: null, colKey: null });
      return;
    }

    const competencyLabel = competencies?.[competencyIndex];
    if (!competencyLabel) {
      setCurrentEdit({ competencyIndex: null, rowKind: null, colKey: null });
      return;
    }

    const applyTo = (prev) => {
      const prevRow = prev?.[competencyLabel];
      const nextRow = {
        ...(typeof prevRow === "object" && prevRow != null ? prevRow : {}),
        [colKey]: editValue,
      };
      return { ...(prev || {}), [competencyLabel]: nextRow };
    };

    if (rowKind === "self") {
      setLocalSelfRatings((prev) => {
        const next = applyTo(prev);
        if (typeof onSelfRatingsChange === "function") {
          onSelfRatingsChange(next);
        }
        return next;
      });
    } else {
      setLocalCohortRatings((prev) => {
        const next = applyTo(prev);
        if (typeof onCohortRatingsChange === "function") {
          onCohortRatingsChange(next);
        }
        return next;
      });
    }

    setCurrentEdit({ competencyIndex: null, rowKind: null, colKey: null });
  };

  const handleBlur = () => {
    commitEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
  };

  const renderScoreCell = ({ competencyIndex, rowKind, colKey, value, extraClassName }) => {
    const isEditing =
      currentEdit.competencyIndex === competencyIndex &&
      currentEdit.rowKind === rowKind &&
      currentEdit.colKey === colKey;

    return (
      <td
        className={`pc-cell pc-score ${extraClassName || ""}${
          isEditing ? " editing" : ""
        }`}
        onClick={() => startEdit({ competencyIndex, rowKind, colKey, value })}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="pc-input"
          />
        ) : (
          value
        )}
      </td>
    );
  };

  return (
    <table className="pc-table">
      <thead>
        <tr>
          <th className="pc-col-label" colSpan={2}></th>
          <th className="pc-col-self">Self</th>
          <th className="pc-col-mgr">Manager (Avg.)</th>
          <th className="pc-col-team">Team Members (Avg.)</th>
          <th className="pc-col-peers">Peers (Avg.)</th>
        </tr>
      </thead>
      <tbody>
        {competencies.map((label, idx) => (
          <React.Fragment key={label ?? idx}>
            <tr>
              <td className="pc-label" rowSpan={2}>
                {label}
              </td>
              <td className="pc-cell pc-your">Your Rating</td>
              {COLS.map((c) =>
                React.cloneElement(
                  renderScoreCell({
                    competencyIndex: idx,
                    rowKind: "self",
                    colKey: c.key,
                    value: valueAt(localSelfRatings, label, c.key),
                  }),
                  { key: `self-${label ?? idx}-${c.key}` },
                ),
              )}
            </tr>
            <tr>
              <td className="pc-cell pc-cohort pc-cohort-color">
                Cohort Rating (Avg.)
              </td>
              {COLS.map((c) =>
                React.cloneElement(
                  renderScoreCell({
                    competencyIndex: idx,
                    rowKind: "cohort",
                    colKey: c.key,
                    value: valueAt(localCohortRatings, label, c.key),
                    extraClassName: "pc-cohort-color",
                  }),
                  { key: `cohort-${label ?? idx}-${c.key}` },
                ),
              )}
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ParticipantCohortTable;
