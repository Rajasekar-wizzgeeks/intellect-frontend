import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/stopDoingPage.scss";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const EditableCell = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="sd-edit-textarea"
    />
  );
};

const EditableTrait = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  useEffect(() => {
    setEditValue(String(value ?? ""));
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="sd-trait-edit-textarea"
    />
  );
};

const StopDoingTraits = ({ traits, traitsTitle, traitsSubtitle, onTraitsChange }) => {
  const [editing, setEditing] = useState(null); // { idx }

  return (
    <div className="sd-traits">
      <div className="sd-traits__header">
        <div className="sd-traits__title">{traitsTitle}</div>
        <div className="sd-traits__subtitle">{traitsSubtitle}</div>
        <div className="sd-traits__underline" aria-hidden="true" />
      </div>

      <div
        className="sd-traits__grid"
        role="list"
        aria-label="Most predominant traits"
      >
        {traits.map((t, idx) => (
          <div
            key={`${String(t ?? "")}-${idx}`}
            className={`sd-trait-card sd-trait-card--${idx < 4 ? "lg" : idx < 8 ? "md" : "sm"}`.trim()}
            role="listitem"
            onDoubleClick={() => setEditing({ idx })}
            style={{ cursor: "pointer" }}
          >
            {editing?.idx === idx ? (
              <EditableTrait
                key={idx}
                value={t}
                onSave={(newValue) => {
                  const updated = [...traits];
                  updated[idx] = newValue;
                  onTraitsChange(updated);
                  setEditing(null);
                }}
              />
            ) : (
              <p className="sd-trait-card-text" title={capitalize(t)}>
                {formatTraitText(t)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StopDoingGrid = ({ title, columns, onColumnsChange, rowOffset = 0 ,lastChunk}) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }

  return (
    <div className="sd-grid"  role="table"  style={{"grid-template-columns": columns.length > 2 ? "1fr 1fr 1fr" : "1fr 1fr",paddingBottom:lastChunk? 0 :0}} aria-label={title}>
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="sd-col" 
        // style={{borderTop:lastChunk ? 1 : "none" }}
         role="rowgroup">
          {col.map((row, rowIdx) => (
            <div key={rowIdx} className="sd-row" role="row">
              <div
                className="sd-cell"
                role="cell"
                onDoubleClick={() => setEditing({ colIdx, rowIdx })}
                style={{ cursor: "pointer" }}
              >
                {editing?.colIdx === colIdx && editing?.rowIdx === rowIdx ? (
                  <EditableCell
                    key={`${colIdx}-${rowIdx}`}
                    value={columns[colIdx]?.[rowIdx]}
                    onSave={(newValue) => {
                      const absoluteRowIdx = rowOffset + rowIdx;
                      onColumnsChange((prevColumns) => {
                        const nextColumns = Array.isArray(prevColumns)
                          ? [...prevColumns]
                          : [];
                        if (!nextColumns[colIdx]) nextColumns[colIdx] = [];
                        nextColumns[colIdx] = [...nextColumns[colIdx]];
                        nextColumns[colIdx][absoluteRowIdx] = newValue;
                        return nextColumns;
                      });
                      setEditing(null);
                    }}
                  />
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {String(row ?? "")}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const capitalize = (value) => {
  if (typeof value !== "string") return value;
  if (!value.length) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatTraitText = (value, maxLength = 140) => {
  const full = capitalize(value || "");
  if (full.length <= maxLength) return full;
  return `${full.slice(0, maxLength - 1).trimEnd()}…`;
};

const StopDoingPage = ({
  title = "What the Nominee Should “Stop Doing”…",
  columns,
  left = [],
  right = [],
  traitsTitle = "Most Predominant Leadership Trait",
  traitsSubtitle = "(Traits that occur more than once)",
  traits = [],
  footnote = "* This excludes self feedback",
}) => {
  const [localColumns, setLocalColumns] = useState(() =>
    Array.isArray(columns) ? columns : [left, right],
  );  

  useEffect(() => {
    if (Array.isArray(columns)) {
      setLocalColumns(columns);
    }
  }, [columns]);

  const [localTraits, setLocalTraits] = useState(traits);

  useEffect(() => {
    setLocalTraits(traits);
  }, [traits]);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);

    out.push(
      <FeedbackCommonHeader key="sd-hdr" title={title} titleWidth="100" className="sd-header" />,
    );
  
    if (hasColumns) {
      const maxRows = Math.max(
        0,
        ...localColumns.map((c) => (Array.isArray(c) ? c.length : 0)),
      );
      const rowsPerChunk = 10;
      const chunkCount = Math.max(1, Math.ceil(maxRows / rowsPerChunk));
     
      for (let chunkIdx = 0; chunkIdx < chunkCount; chunkIdx += 1) {
        const start = chunkIdx * rowsPerChunk;
        const end = start + rowsPerChunk;
        const chunkColumns = localColumns.map((col) =>
          Array.isArray(col) ? col.slice(start, end) : [],
        );

        out.push(
          <div className="sd-grid-wrapper" >
          <StopDoingGrid
            key={`sd-grid-${chunkIdx}`}
            title={title}
            columns={chunkColumns}
            onColumnsChange={setLocalColumns}
            rowOffset={start}
            lastChunk={chunkIdx === chunkCount - 1}
          />
          </div>,
        );
      }
    }

    out.push(
      <div className="sd-traits-container">
      <StopDoingTraits
        key="sd-traits"
        traits={localTraits}
        traitsTitle={traitsTitle}
        traitsSubtitle={traitsSubtitle}
        onTraitsChange={setLocalTraits}
      />
      <div key="sd-foot" className="sd-footnote">
        {footnote}
      </div>
      </div>
    );

 

    return out;
  }, [
    footnote,
    localColumns,
    title,
    localTraits,
    traitsSubtitle,
    traitsTitle,
  ]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={990}
      pagePadding={0}
      contentClassName="stop-doing-page"
      componentId="stop-doing"
    />
    // </div>
  );
};

export default StopDoingPage;
