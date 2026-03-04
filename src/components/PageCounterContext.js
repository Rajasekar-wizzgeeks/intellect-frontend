import React, { createContext, useContext, useRef } from "react";

const PageCounterContext = createContext();

export const usePageCounter = () => {
  const context = useContext(PageCounterContext);
  if (!context) {
    throw new Error("usePageCounter must be used within PageCounterProvider");
  }
  return context;
};

export const PageCounterProvider = ({ children }) => {
  const currentPageRef = useRef(1);
  const sectionRefs = useRef(new Map()); // Store page counts per component

  const registerSection = (id, pageCount) => {
    sectionRefs.current.set(id, {
      startPage: currentPageRef.current,
      pageCount,
      endPage: currentPageRef.current + pageCount - 1,
    });

    const start = currentPageRef.current;
    currentPageRef.current += pageCount;

    return start;
  };

  const getSectionInfo = (id) => {
    return sectionRefs.current.get(id);
  };

  const getTotalPages = () => {
    return currentPageRef.current - 1;
  };

  return (
    <PageCounterContext.Provider
      value={{
        registerSection,
        getSectionInfo,
        getTotalPages,
        currentPage: currentPageRef.current,
      }}
    >
      {children}
    </PageCounterContext.Provider>
  );
};
