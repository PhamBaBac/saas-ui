import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pagination = ({ page, totalPages, totalElements, size, onPageChange }) => {
  if (totalPages <= 1) return null;

  const startIdx = page * size + 1;
  const endIdx = Math.min((page + 1) * size, totalElements);

  // Generate range of page numbers
  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(0, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(0, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-10 py-5 border-t border-slate-100 bg-white">
      <div className="text-[12px] font-bold text-slate-400">
        Showing <span className="text-slate-700 font-black">{startIdx}</span> to{' '}
        <span className="text-slate-700 font-black">{endIdx}</span> of{' '}
        <span className="text-slate-700 font-black">{totalElements}</span> entries
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        >
          <ChevronLeft size={16} />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            className={`h-9 w-9 rounded-xl text-[12px] font-black p-0 transition-all ${
              p === page
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 scale-105'
                : 'border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages - 1}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
