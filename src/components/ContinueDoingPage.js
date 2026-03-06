import React, { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import AutoPaginatedSections from "./AutoPaginatedSections";
import FeedbackCommonHeader from "./FeedbackCommonHeader";
import "../styles/continueDoingPage.scss";

const EditableCell = ({ value, onSave }) => {
  const [editValue, setEditValue] = useState(String(value ?? ""));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSave(editValue);
    } 
    // else if (e.key === "Escape") {
    //   onCancel();
    // }
  };

  return (
    <textarea
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={() => onSave(editValue)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="cd-edit-textarea"
    />
  );
};

const ContinueDoingGrid = ({ title, columns, onColumnsChange, rowOffset = 0 }) => {
  const [editing, setEditing] = useState(null); // { colIdx, rowIdx }

  return (
    <div className="cd-grid" role="table" aria-label={title}>
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="cd-col" role="rowgroup">
          {col.map((row, rowIdx) => (
            <div key={rowIdx} className="cd-row" role="row">
              <div
                className="cd-cell"
                role="cell"
                onDoubleClick={() => setEditing({ colIdx, rowIdx })}
                style={{ cursor: "pointer" }}
              >
                {editing?.colIdx === colIdx && editing?.rowIdx === rowIdx ? (
                  <EditableCell
                    value={columns[colIdx]?.[rowIdx]}
                    onSave={(newValue) => {
                      const updated = [...columns];
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

const ContinueDoingPage = ({
  title = "What the Nominee Should “Continue Doing”…",
  columns = [],
  footnote = "* This excludes self feedback",
  immediateActionSummary,
}) => {
  const [localColumns, setLocalColumns] = useState(columns);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const blocks = useMemo(() => {
    const out = [];

    const hasColumns =
      Array.isArray(localColumns) &&
      localColumns.some((c) => Array.isArray(c) && c.length);

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
          <ContinueDoingGrid
            key={`cd-grid-${chunkIdx}`}
            title={title}
            columns={chunkColumns}
            onColumnsChange={setLocalColumns}
            rowOffset={start}
          />,
        );
      }
    }

    if (footnote) {
      out.push(
        <div key="cd-foot" className="cd-footnote">
          {footnote}
        </div>,
      );
    }

    if (immediateActionSummary) {
      const {
        title: iaTitle = "Immediate Action Areas - Summary",
        description = "Repeated themes, if any are captured as a snapshot to facilitate understanding and further action",
        note = "Note: If comments have been very diverse with no commonality, it will not be captured here but can be referenced in the individual slides",
        columns: iaCols = {
          continue: [],
          start: [],
          stop: [],
        },
      } = immediateActionSummary;

      out.push(
        <div key="cd-ia" className="cd-ia">
          {/* <div className="cd-ia__title">{iaTitle}</div>
          <div className="cd-ia__underline" aria-hidden="true" /> */}

          <div className="cd-ia__desc">{description}</div>
          <div className="cd-ia__note">{note}</div>

          <div className="cd-ia__panel" role="table" aria-label={iaTitle}>
            <div className="cd-ia-col" role="rowgroup">
              <div
                className="cd-ia-col__head cd-ia-col__head--continue"
                role="row"
              >
                CONTINUE
              </div>
              <div
                className="cd-ia-col__body cd-ia-col__body--continue"
                role="row"
              >
                {iaCols.continue.map((t, i) => (
                  <div key={i} className="cd-ia-bullet" role="row">
                    <span className="cd-ia-bullet__dot" aria-hidden="true">
                      •
                    </span>
                    <span className="cd-ia-bullet__text">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-ia-col" role="rowgroup">
              <div
                className="cd-ia-col__head cd-ia-col__head--start"
                role="row"
              >
                START
              </div>
              <div
                className="cd-ia-col__body cd-ia-col__body--start"
                role="row"
              >
                {iaCols.start.map((t, i) => (
                  <div key={i} className="cd-ia-bullet" role="row">
                    <span className="cd-ia-bullet__dot" aria-hidden="true">
                      •
                    </span>
                    <span className="cd-ia-bullet__text">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-ia-col" role="rowgroup">
              <div className="cd-ia-col__head cd-ia-col__head--stop" role="row">
                STOP
              </div>
              <div className="cd-ia-col__body cd-ia-col__body--stop" role="row">
                {iaCols.stop.map((t, i) => (
                  <div key={i} className="cd-ia-bullet" role="row">
                    <span className="cd-ia-bullet__dot" aria-hidden="true">
                      •
                    </span>
                    <span className="cd-ia-bullet__text">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
      );
    }

    return out;
  }, [localColumns, footnote, immediateActionSummary, title]);

  const Header = useMemo(() => {
    return () => (
      <FeedbackCommonHeader key="cd-hdr" title={title} titleWidth="100" className="cd-header" />
    );
  }, [title]);

  return (
    // <div className="section-page-container">
    <AutoPaginatedSections
      blocks={blocks}
      pageWidth={794}
      pageHeight={950}
      pagePadding={0}
      HeaderComponent={Header}
      contentClassName="continue-doing-page"
      componentId="continue-doing"
    />
    // </div>
  );
};

export default ContinueDoingPage;
