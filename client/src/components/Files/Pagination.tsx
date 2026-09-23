import { useState } from "react";

export const Pagination = ({ totalPages = 3 }) => {
  const [page, setPage] = useState(1);

  return (
    <div className="flex justify-center my-4 items-center gap-2">
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-500 disabled:opacity-40"
      >
        ‹
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm
              ${
                page === p
                  ? "bg-[#047857] text-white"
                  : "border border-gray-300 text-gray-500 hover:border-[#047857] hover:text-[#047857]"
              }`}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-md border text-gray-500 disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
