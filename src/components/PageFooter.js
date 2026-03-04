import React from "react";

const PageFooter = ({ pageNumber }) => {
  if (pageNumber === undefined || pageNumber === null) return null;
  return <div className="page-footer">{pageNumber}</div>;
};

export default PageFooter;
