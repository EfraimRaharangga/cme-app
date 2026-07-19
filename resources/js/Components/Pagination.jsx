import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10,
    className = ''
}) {
    if (totalPages <= 1) return null;

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, currentPage + 2);

            if (start === 1) {
                end = 5;
            } else if (end === totalPages) {
                start = totalPages - 4;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    const btnBase = "h-8 px-2.5 rounded-lg border border-border text-xs font-semibold text-text hover:bg-gray-50 hover:text-primary hover:border-primary disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center gap-1";
    const activeBtn = "h-8 w-8 rounded-lg bg-primary border-transparent text-white text-xs font-bold transition flex items-center justify-center";
    const inactiveBtn = "h-8 w-8 rounded-lg border border-border text-xs font-semibold text-text hover:bg-gray-50 hover:text-primary hover:border-primary transition flex items-center justify-center";

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 py-3 border-t border-border ${className}`}>
            <div className="text-xs text-gray-500 font-medium">
                Menampilkan <span className="font-semibold text-text">{from}</span> - <span className="font-semibold text-text">{to}</span> dari <span className="font-semibold text-text">{totalItems}</span> data
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={btnBase}
                    title="Halaman Pertama"
                    type="button"
                >
                    <ChevronsLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={btnBase}
                    title="Halaman Sebelumnya"
                    type="button"
                >
                    <ChevronLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {pageNumbers[0] > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className={inactiveBtn} type="button">1</button>
                        {pageNumbers[0] > 2 && <span className="text-gray-400 px-1 text-xs">...</span>}
                    </>
                )}

                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={page === currentPage ? activeBtn : inactiveBtn}
                        type="button"
                    >
                        {page}
                    </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-gray-400 px-1 text-xs">...</span>}
                        <button onClick={() => onPageChange(totalPages)} className={inactiveBtn} type="button">{totalPages}</button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={btnBase}
                    title="Halaman Selanjutnya"
                    type="button"
                >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={btnBase}
                    title="Halaman Terakhir"
                    type="button"
                >
                    <ChevronsRight className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
            </div>
        </div>
    );
}
