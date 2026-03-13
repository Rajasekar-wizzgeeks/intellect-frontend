// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import { createRoot } from "react-dom/client";
// import measurementManager from "./measurementManager"; // Import the manager
// import "../styles/mainPage.scss";

// /**
//  * AutoPaginatedSections - Enhanced with sequential measurement
//  */
// const AutoPaginatedSections = ({
//   blocks = [],
//   startPage = 1,
//   pageWidth = 794,
//   pageHeight = 950,
//   pagePadding = 20,
//   HeaderComponent,
//   paddingLeft = 0,
//   contentClassName = "content-page",
//   componentId,
// }) => {
//   const [headerHeight, setHeaderHeight] = useState(0);
//   const [heights, setHeights] = useState([]);
//   const [pages, setPages] = useState([]);
//   const [measured, setMeasured] = useState(false);
//   const [hasError, setHasError] = useState(false);
//   const [isMeasuringLocal, setIsMeasuringLocal] = useState(false);
//   const [lastPageCount, setLastPageCount] = useState(0);

//   const measurementId = useRef(
//     componentId ||
//       `auto-page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
//   );
//   const cleanupRef = useRef(null);
//   const isUnmounted = useRef(false);

//   const USABLE_HEIGHT = useMemo(
//     () => pageHeight - pagePadding * 2 - (HeaderComponent ? headerHeight : 0),
//     [pageHeight, pagePadding, HeaderComponent, headerHeight]
//   );

//   const isBrowser =
//     typeof window !== "undefined" && typeof document !== "undefined";

//   /* -------------------------------------------------------
//    * MEASUREMENT FUNCTION
//    * ----------------------------------------------------- */
//   const performMeasurement = useCallback(async () => {
//     if (!isBrowser || !blocks.length || isUnmounted.current) {
//       return { blockHeights: [], headerHeightPx: 0 };
//     }

//     setIsMeasuringLocal(true);

//     return new Promise((resolve) => {
//       const container = document.createElement("div");
//       container.style.position = "absolute";
//       container.style.visibility = "hidden";
//       container.style.width = `${pageWidth}px`;
//       container.style.left = "-100000px";
//       container.style.top = "0";
//       container.style.zIndex = "-9999";
//       container.style.pointerEvents = "none";
//       container.id = `measurement-${measurementId.current}`;

//       document.body.appendChild(container);

//       const root = createRoot(container);

//       root.render(
//         <div className={contentClassName}>
//           {HeaderComponent ? <HeaderComponent /> : null}
//           {blocks.map((b, i) => (
//             <div key={i} data-blockindex={i} style={{ paddingLeft }}>
//               {b}
//             </div>
//           ))}
//         </div>
//       );

//       const measure = async () => {
//         try {
//           // Wait for fonts and layout
//           if (document.fonts?.ready) {
//             await document.fonts.ready;
//           }

//           // Triple requestAnimationFrame for reliable layout
//           await new Promise((resolveFrame) => {
//             requestAnimationFrame(() => {
//               requestAnimationFrame(() => {
//                 requestAnimationFrame(() => {
//                   resolveFrame();
//                 });
//               });
//             });
//           });

//           const content = container.firstElementChild;
//           if (!content) {
//             throw new Error("No content for measurement");
//           }

//           const children = Array.from(content.children);
//           let headerHeightPx = 0;
//           let startIndex = 0;

//           if (HeaderComponent && children[0]) {
//             const headerRect = children[0].getBoundingClientRect();
//             headerHeightPx = Math.ceil(headerRect.height);
//             startIndex = 1;
//           }

//           const blockElements = children.slice(startIndex);
//           const blockHeights = blockElements.map((node) => {
//             const rect = node.getBoundingClientRect();
//             return Math.ceil(rect.height);
//           });

//           resolve({ blockHeights, headerHeightPx });
//         } catch (error) {
//           console.error(
//             `Measurement error for ${measurementId.current}:`,
//             error
//           );
//           resolve({ blockHeights: [], headerHeightPx: 0 });
//         } finally {
//           // Cleanup
//           try {
//             root.unmount();
//           } catch {}
//           container.remove();
//           setIsMeasuringLocal(false);
//         }
//       };

//       // Small delay before measurement
//       setTimeout(measure, 30);
//     });
//   }, [
//     blocks,
//     pageWidth,
//     HeaderComponent,
//     contentClassName,
//     isBrowser,
//     paddingLeft,
//   ]);

//   /* -------------------------------------------------------
//    * 1️⃣ MEASURE BLOCK HEIGHTS WITH QUEUE
//    * ----------------------------------------------------- */
//   useEffect(() => {
//     if (!isBrowser || !blocks.length) {
//       setMeasured(true);
//       return;
//     }

//     isUnmounted.current = false;

//     const measureWithQueue = async () => {
//       try {
//         // Add to queue and wait for turn
//         await measurementManager.addToQueue(measurementId.current, async () => {
//           if (isUnmounted.current) return;

//           const result = await performMeasurement();

//           if (!isUnmounted.current && result.blockHeights.length > 0) {
//             setHeights(result.blockHeights);
//             setHeaderHeight(result.headerHeightPx);
//           }
//         });

//         if (!isUnmounted.current) {
//           setMeasured(true);
//         }
//       } catch (error) {
//         console.error(
//           `Queue measurement failed for ${measurementId.current}:`,
//           error
//         );
//         if (!isUnmounted.current) {
//           setHasError(true);
//           setMeasured(true);
//         }
//       }
//     };

//     measureWithQueue();

//     return () => {
//       isUnmounted.current = true;
//       measurementManager.removeFromQueue(measurementId.current);

//       if (cleanupRef.current) {
//         cleanupRef.current();
//       }
//     };
//   }, [
//     blocks,
//     pageWidth,
//     HeaderComponent,
//     contentClassName,
//     isBrowser,
//     paddingLeft,
//     performMeasurement,
//   ]);

//   /* -------------------------------------------------------
//    * 2️⃣ PAGINATE BLOCKS
//    * ----------------------------------------------------- */
//   useEffect(() => {
//     if (!measured || heights.length === 0 || !blocks.length) {
//       if (measured && blocks.length > 0) {
//         // Fallback to single page
//         setPages([blocks]);
//       }
//       return;
//     }

//     try {
//       const result = [];
//       let currentPage = [];
//       let usedHeight = 0;

//       heights.forEach((h, i) => {
//         if (h > USABLE_HEIGHT) {
//           if (currentPage.length > 0) {
//             result.push([...currentPage]);
//             currentPage = [];
//             usedHeight = 0;
//           }
//           result.push([blocks[i]]);
//           return;
//         }

//         if (usedHeight + h > USABLE_HEIGHT) {
//           result.push([...currentPage]);
//           currentPage = [blocks[i]];
//           usedHeight = h;
//         } else {
//           currentPage.push(blocks[i]);
//           usedHeight += h;
//         }
//       });

//       if (currentPage.length > 0) {
//         result.push([...currentPage]);
//       }

//       setPages(result);
//     } catch (error) {
//       console.error("Pagination error:", error);
//       setPages([blocks]);
//     }
//   }, [heights, blocks, USABLE_HEIGHT, measured]);

//   /* -------------------------------------------------------
//    * RENDER LOGIC
//    * ----------------------------------------------------- */
//   if (!measured || isMeasuringLocal) {
//     return (
//       <section
//         className="section-page pdf-section"
//         style={{ padding: pagePadding }}
//       >
//         <div className={contentClassName}>
//           <div
//             style={{
//               textAlign: "center",
//               padding: "60px 20px",
//               color: "#666",
//               fontStyle: "italic",
//             }}
//           >
//             Measuring content layout...
//           </div>
//         </div>
//       </section>
//     );
//   }

//   // if (hasError || pages.length === 0) {
//   //   return (
//   //     <section
//   //       className="section-page pdf-section"
//   //       style={{ padding: pagePadding }}
//   //     >
//   //       <div className={contentClassName}>
//   //         {HeaderComponent ? <HeaderComponent /> : null}
//   //         {blocks.map((b, i) => (
//   //           <div key={i} style={{ paddingLeft }}>
//   //             {b}
//   //           </div>
//   //         ))}
//   //       </div>
//   //       {/* Page number is now handled globally via CSS counters in mainPage.scss */}
//   //     </section>
//   //   );
//   // }
//   // useState(() => {
//   //   setLastPageCount(startPage + pages.length);
//   // }, [pages]);

//   return (
//     <div>
//       {pages.map((pageBlocks, pageIndex) => (
//         <section
//           key={`page-${measurementId.current}-${pageIndex}`}
//           className="section-page pdf-section"
//           style={{ padding: pagePadding }}
//         >
//           <div className={contentClassName}>
//             {HeaderComponent ? <HeaderComponent /> : null}
//             {pageBlocks.map((block, i) => (
//               <div
//                 key={`block-${measurementId.current}-${pageIndex}-${i}`}
//                 style={{ paddingLeft }}
//                 data-page-index={pageIndex}
//                 data-block-index={i}
//                 data-last-on-page={i === pageBlocks.length - 1 ? "true" : "false"}
//               >
//                 {block}
//               </div>
//             ))}
//           </div>
//         </section>
//       ))}
//     </div>
//   );
// };

// export default AutoPaginatedSections;


import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager"; // Import the manager
import "../styles/mainPage.scss";

/**
 * AutoPaginatedSections - Enhanced with sequential measurement
 */
const AutoPaginatedSections = ({
  blocks = [],
  startPage = 1,
  pageWidth = 794,
  pageHeight = 950,
  pagePadding = 20,
  HeaderComponent,
  paddingLeft = 0,
  contentClassName = "content-page",
  componentId,
}) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [heights, setHeights] = useState([]);
  const [pages, setPages] = useState([]);
  const [measured, setMeasured] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMeasuringLocal, setIsMeasuringLocal] = useState(false);
  const [lastPageCount, setLastPageCount] = useState(0);

  const measurementId = useRef(
    componentId ||
      `auto-page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );
  const cleanupRef = useRef(null);
  const isUnmounted = useRef(false);

  const USABLE_HEIGHT = useMemo(
    () => pageHeight - pagePadding * 2 - (HeaderComponent ? headerHeight : 0),
    [pageHeight, pagePadding, HeaderComponent, headerHeight]
  );

  const isBrowser =
    typeof window !== "undefined" && typeof document !== "undefined";

  /* -------------------------------------------------------
   * MEASUREMENT FUNCTION
   * ----------------------------------------------------- */
  const performMeasurement = useCallback(async () => {
    if (!isBrowser || !blocks.length || isUnmounted.current) {
      return { blockHeights: [], headerHeightPx: 0 };
    }

    setIsMeasuringLocal(true);

    return new Promise((resolve) => {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.visibility = "hidden";
      container.style.width = `${pageWidth}px`;
      container.style.left = "-100000px";
      container.style.top = "0";
      container.style.zIndex = "-9999";
      container.style.pointerEvents = "none";
      container.id = `measurement-${measurementId.current}`;

      document.body.appendChild(container);

      const root = createRoot(container);

      root.render(
        <div className={contentClassName}>
          {HeaderComponent ? <HeaderComponent /> : null}
          {blocks.map((b, i) => (
            <div key={i} data-blockindex={i} style={{ paddingLeft }}>
              {b}
            </div>
          ))}
        </div>
      );

      const measure = async () => {
        try {
          // Wait for fonts and layout
          if (document.fonts?.ready) {
            await document.fonts.ready;
          }

          // Triple requestAnimationFrame for reliable layout
          await new Promise((resolveFrame) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  resolveFrame();
                });
              });
            });
          });

          const content = container.firstElementChild;
          if (!content) {
            throw new Error("No content for measurement");
          }

          const children = Array.from(content.children);
          let headerHeightPx = 0;
          let startIndex = 0;

          if (HeaderComponent && children[0]) {
            const headerRect = children[0].getBoundingClientRect();
            headerHeightPx = Math.ceil(headerRect.height);
            startIndex = 1;
          }

          const blockElements = children.slice(startIndex);
          const blockHeights = blockElements.map((node) => {
            const rect = node.getBoundingClientRect();
            const height = Math.ceil(rect.height);
            
            // Log warning for empty blocks (optional)
            if (height === 0) {
              console.warn('Block has zero height - might be empty:', node);
            }
            
            return height;
          });

          resolve({ blockHeights, headerHeightPx });
        } catch (error) {
          console.error(
            `Measurement error for ${measurementId.current}:`,
            error
          );
          resolve({ blockHeights: [], headerHeightPx: 0 });
        } finally {
          // Cleanup
          try {
            root.unmount();
          } catch {}
          container.remove();
          setIsMeasuringLocal(false);
        }
      };

      // Small delay before measurement
      setTimeout(measure, 30);
    });
  }, [
    blocks,
    pageWidth,
    HeaderComponent,
    contentClassName,
    isBrowser,
    paddingLeft,
  ]);

  /* -------------------------------------------------------
   * 1️⃣ MEASURE BLOCK HEIGHTS WITH QUEUE
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!isBrowser || !blocks.length) {
      setMeasured(true);
      return;
    }

    isUnmounted.current = false;

    const measureWithQueue = async () => {
      try {
        // Add to queue and wait for turn
        await measurementManager.addToQueue(measurementId.current, async () => {
          if (isUnmounted.current) return;

          const result = await performMeasurement();

          if (!isUnmounted.current && result.blockHeights.length > 0) {
            setHeights(result.blockHeights);
            setHeaderHeight(result.headerHeightPx);
          }
        });

        if (!isUnmounted.current) {
          setMeasured(true);
        }
      } catch (error) {
        console.error(
          `Queue measurement failed for ${measurementId.current}:`,
          error
        );
        if (!isUnmounted.current) {
          setHasError(true);
          setMeasured(true);
        }
      }
    };

    measureWithQueue();

    return () => {
      isUnmounted.current = true;
      measurementManager.removeFromQueue(measurementId.current);

      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [
    blocks,
    pageWidth,
    HeaderComponent,
    contentClassName,
    isBrowser,
    paddingLeft,
    performMeasurement,
  ]);

  /* -------------------------------------------------------
   * 2️⃣ PAGINATE BLOCKS - FIXED TO PREVENT EMPTY PAGES
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!measured || heights.length === 0 || !blocks.length) {
      if (measured && blocks.length > 0) {
        // Fallback to single page
        setPages([blocks]);
      }
      return;
    }

    try {
      const result = [];
      let currentPage = [];
      let usedHeight = 0;

      heights.forEach((h, i) => {
        // Skip blocks with zero height (empty content)
        if (h <= 0) {
          // Option 1: Skip empty blocks entirely
          // Just ignore them and don't add to any page
          return;
          
          // Option 2: If you want to keep empty blocks but prevent empty pages:
          // if (currentPage.length === 0 && result.length > 0) {
          //   // Add to previous page if possible
          //   const lastPageIndex = result.length - 1;
          //   result[lastPageIndex].push(blocks[i]);
          // } else if (currentPage.length > 0) {
          //   currentPage.push(blocks[i]);
          //   // Height doesn't increase for empty blocks
          // }
          // return;
        }

        if (h > USABLE_HEIGHT) {
          // Block is taller than page - needs its own page
          if (currentPage.length > 0) {
            result.push([...currentPage]);
            currentPage = [];
            usedHeight = 0;
          }
          // Only add if block has content (height > 0)
          result.push([blocks[i]]);
          return;
        }

        if (usedHeight + h > USABLE_HEIGHT) {
          // Start new page
          if (currentPage.length > 0) {
            result.push([...currentPage]);
          }
          currentPage = [blocks[i]];
          usedHeight = h;
        } else {
          // Add to current page
          currentPage.push(blocks[i]);
          usedHeight += h;
        }
      });

      // Don't add empty last page
      if (currentPage.length > 0) {
        result.push([...currentPage]);
      }

      // Filter out any pages that might be empty (just in case)
      const nonEmptyPages = result.filter(page => page.length > 0);
      
      // If all pages were empty, fallback to original blocks
      if (nonEmptyPages.length === 0 && blocks.length > 0) {
        console.warn('All pages were empty, falling back to original blocks');
        setPages([blocks]);
      } else {
        setPages(nonEmptyPages);
      }
      
    } catch (error) {
      console.error("Pagination error:", error);
      setPages([blocks]);
    }
  }, [heights, blocks, USABLE_HEIGHT, measured]);

  /* -------------------------------------------------------
   * RENDER LOGIC
   * ----------------------------------------------------- */
  if (!measured || isMeasuringLocal) {
    return (
      <section
        className="section-page pdf-section"
        style={{ padding: pagePadding }}
      >
        <div className={contentClassName}>
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            Measuring content layout...
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {pages.map((pageBlocks, pageIndex) => (
        <section
          key={`page-${measurementId.current}-${pageIndex}`}
          className="section-page pdf-section"
          style={{ padding: pagePadding }}
        >
          <div className={contentClassName}>
            {HeaderComponent ? <HeaderComponent /> : null}
            {pageBlocks.map((block, i) => (
              <div
                key={`block-${measurementId.current}-${pageIndex}-${i}`}
                style={{ paddingLeft }}
                data-page-index={pageIndex}
                data-block-index={i}
                data-last-on-page={i === pageBlocks.length - 1 ? "true" : "false"}
              >
                {block}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default AutoPaginatedSections;