import React from "react";
import "../styles/davCommonHeader.scss";

const DavCommonHeader = ({ title, className = "" }) => {
  return (
    <div className={`dav-common-header ${className}`.trim()}>
      <div className="dav-common-header__title">{title}</div>
      <div className="dav-common-header__underline" />
    </div>
  );
};

export default DavCommonHeader;
