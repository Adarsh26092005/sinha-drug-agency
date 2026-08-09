import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

export function paginate(items, currentPage) {
    const start = (currentPage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
}

export function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
}

export default function Pagination({ currentPage, totalItems, onPageChange }) {
    const totalPages = getTotalPages(totalItems);

    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(currentPage * PAGE_SIZE, totalItems);

    // Build a compact page list: 1 ... 4 5 6 ... 12
    const pages = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        if (currentPage <= 3) endPage = 4;
        if (currentPage >= totalPages - 2) startPage = totalPages - 3;
        if (startPage > 2) pages.push("...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
    }

    return (
        <div className="flex items-center justify-between mt-4 px-1 flex-wrap gap-3">
            <p className="text-slate-500 text-xs">
                Showing {start}-{end} of {totalItems}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-slate-600 text-sm">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage
                                    ? "bg-emerald-500 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}