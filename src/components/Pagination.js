import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/pagination.scss";

const Pagination = ({ page, totalPages, total, perPage, onPageChange }) => {
  if (!totalPages || totalPages < 1 || total === 0) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Build page numbers array with "..." ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  return (
    <div className="pagination">
      <span className="pagination__info">
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination__controls">
        <button
          className="pagination__btn"
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pagination__btn pagination__btn--page${p === page ? " active" : ""}`}
              onClick={() => go(p)}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pagination__btn"
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
