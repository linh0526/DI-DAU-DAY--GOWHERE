'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex justify-center items-center gap-2 mt-16", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-amber-600 hover:border-amber-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={cn(
              "min-w-[48px] h-12 flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
              page === currentPage
                ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20 scale-110"
                : page === '...'
                ? "bg-transparent text-slate-300 cursor-default"
                : "bg-white border-2 border-slate-100 text-slate-400 hover:border-amber-600 hover:text-amber-600 shadow-sm active:scale-95"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-amber-600 hover:border-amber-600 disabled:opacity-30 disabled:hover:border-slate-100 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
