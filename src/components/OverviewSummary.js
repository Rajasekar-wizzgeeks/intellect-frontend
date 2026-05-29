import React, { useEffect, useMemo, useState } from "react";
import AutoPaginatedSections from "./AutoPaginatedSections";
import Header from "./header";
import HorizontalCompareBar from "./HorizontalCompareBar";
import "../styles/mainPage.scss";
import "../styles/contentPage.scss";
import "../styles/overviewSummary.scss";

const OverviewSummary = ({
  startPage = 13,
  pageWidth = 794,
  pageHeight = 842,
  pagePadding = 10,
  items,
  onDataChange,
}) => {
  const initialRows = useMemo(() => {
    return items && items.length
      ? items
      : [
          { label: "Leadership", self: 2.5, others: 4.0 },
          { label: "Bandwidth", self: 2.5, others: 4.0 },
          { label: "Sales and Customer Centricity", self: 2.5, others: 4.0 },
          { label: "Collaboration", self: 2.5, others: 4.0 },
          { label: "Operational Excellence", self: 2.5, others: 4.0 },
          { label: "Result Orientation", self: 2.5, others: 4.0 },
          { label: "Expertise and Communication", self: 2.5, others: 4.0 },
        ];
  }, [items]);

  const [rows, setRows] = useState(initialRows);
  const [editValue, setEditValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState({
    rowIndex: null,
    field: null,
  });

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const handleValueClick = (rowIndex, field, value) => {
    setCurrentEdit({ rowIndex, field });
    setEditValue(String(value ?? ""));
  };

  const handleValueChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleValueBlur = () => {
    if (currentEdit.rowIndex === null || !currentEdit.field) {
      setCurrentEdit({ rowIndex: null, field: null });
      return;
    }

    setRows((prev) => {
      const next = [...prev];
      const row = next[currentEdit.rowIndex];
      if (!row) return prev;
      next[currentEdit.rowIndex] = {
        ...row,
        [currentEdit.field]: editValue,
      };
      return next;
    });

    setCurrentEdit({ rowIndex: null, field: null });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const blocks = useMemo(() => {
    const out = [];

    out.push(
      <div key="title" className="content-page__title os-title">
        <span className="content-page__title-text os-title__text">
          Overview/Summary of Scores Across 7 Elements
        </span>
      </div>,
    );

    out.push(
      <div key="note" className="os-note">
        <em className="os-note__em">
          <strong> Note:</strong> For categories with more than one respondent,
          scores represent the mean of all individual ratings.
        </em>
      </div>,
    );

    rows.forEach((row, idx) => {
      out.push(
        <div key={`row-${idx}`} className="os-row">
          <div className="os-row__label">{row.label}</div>
          <HorizontalCompareBar
            self={row.self}
            others={row.others}
            editableValues={true}
            onValuesChange={(nextValues) => {
              const nextRows = [...rows];
              const cur = nextRows[idx];
              if (cur) {
                nextRows[idx] = {
                  ...cur,
                  self: nextValues?.self ?? cur.self,
                  others: nextValues?.others ?? cur.others,
                };
                setRows(nextRows);
                if (onDataChange) {
                  onDataChange(nextRows);
                }
              }
            }}
          />
        </div>,
      );
    });

    return out;
  }, [rows]);

  return (
    <AutoPaginatedSections
      blocks={blocks}
      startPage={startPage}
      // pageWidth={pageWidth}
      // pageHeight={pageHeight}
      // pagePadding={pagePadding}
      HeaderComponent={Header}
      contentClassName="content-page"
    />
  );
};

export default OverviewSummary;
