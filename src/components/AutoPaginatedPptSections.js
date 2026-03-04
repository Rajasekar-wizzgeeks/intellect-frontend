import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createRoot } from "react-dom/client";
import measurementManager from "./measurementManager";
import "../styles/mainPage.scss";

/**
 * AutoPaginatedPptSections
 *
 * PPT version of AutoPaginatedSections with its own
 * default slide dimensions and CSS classes.
 */
const AutoPaginatedPptSections = ({
  blocks = [],
  startPage = 1,
  pageWidth = 960, // typical 16:9 PPT width in px
  pageHeight = 540, // typical 16:9 PPT height in px
  pagePadding = 20,
  HeaderComponent,
  paddingLeft = 0,
  contentClassName = "ppt-content-page",
  componentId,
}) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [heights, setHeights] = useState([]);
  const [pages, setPages] = useState([]);
  const [measured, setMeasured] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMeasuringLocal, setIsMeasuringLocal] = useState(false);

  const measurementId = useRef(
    componentId ||
      `auto-ppt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
          if (document.fonts?.ready) {
            await document.fonts.ready;
          }

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
            return Math.ceil(rect.height);
          });

          resolve({ blockHeights, headerHeightPx });
        } catch (error) {
          console.error(
            `PPT measurement error for ${measurementId.current}:`,
            error
          );
          resolve({ blockHeights: [], headerHeightPx: 0 });
        } finally {
          try {
            root.unmount();
          } catch {}
          container.remove();
          setIsMeasuringLocal(false);
        }
      };

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
          `PPT queue measurement failed for ${measurementId.current}:`,
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
   * 2️⃣ PAGINATE BLOCKS
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!measured || heights.length === 0 || !blocks.length) {
      if (measured && blocks.length > 0) {
        setPages([blocks]);
      }
      return;
    }

    try {
      const result = [];
      let currentPage = [];
      let usedHeight = 0;

      heights.forEach((h, i) => {
        if (h > USABLE_HEIGHT) {
          if (currentPage.length > 0) {
            result.push([...currentPage]);
            currentPage = [];
            usedHeight = 0;
          }
          result.push([blocks[i]]);
          return;
        }

        if (usedHeight + h > USABLE_HEIGHT) {
          result.push([...currentPage]);
          currentPage = [blocks[i]];
          usedHeight = h;
        } else {
          currentPage.push(blocks[i]);
          usedHeight += h;
        }
      });

      if (currentPage.length > 0) {
        result.push([...currentPage]);
      }

      setPages(result);
    } catch (error) {
      console.error("PPT pagination error:", error);
      setPages([blocks]);
    }
  }, [heights, blocks, USABLE_HEIGHT, measured]);

  /* -------------------------------------------------------
   * RENDER LOGIC
   * ----------------------------------------------------- */
  if (!measured || isMeasuringLocal) {
    return (
      <section
        className="ppt-section-page"
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
            Measuring slide layout...
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {pages.map((pageBlocks, pageIndex) => (
        <section
          key={`ppt-page-${measurementId.current}-${pageIndex}`}
          className="ppt-section-page"
          style={{ padding: pagePadding }}
        >
          <div className={contentClassName}>
            {HeaderComponent ? <HeaderComponent /> : null}
            {pageBlocks.map((block, i) => (
              <div
                key={`ppt-block-${measurementId.current}-${pageIndex}-${i}`}
                style={{ paddingLeft }}
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

export default AutoPaginatedPptSections;
