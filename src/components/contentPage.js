import React, { useState, useEffect } from "react";
import Header from "./header";
import ReportInfoTable from "./reportInfoTable";
import "../styles/contentPage.scss";

const ContentPage = ({ titleIndex = 1, title = "Introduction", rows: rowsProp, onRowsChange }) => {
  const [rows, setRows] = useState(rowsProp ?? []);

  useEffect(() => {
    setRows(rowsProp ?? []);
  }, [rowsProp]);

  const handleRowsChange = (nextRows) => {
    setRows(nextRows);
    if (onRowsChange) onRowsChange(nextRows);
  };

  return (
    <div className="content-page">
      <Header />

      <h1 className="content-page__title">
        <span className="content-page__title-index">{titleIndex}.</span>
        <span className="content-page__title-text">{title}</span>
      </h1>

      <div className="content-page__table">
        <ReportInfoTable
          rows={rows}
          editable={true}
          onRowsChange={handleRowsChange}
        />
      </div>
    </div>
  );
};

export default ContentPage;
