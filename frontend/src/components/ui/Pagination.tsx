'use client';

import React from 'react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  // Build page list with ellipsis.
  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = allPages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  const withEllipsis: (number | '...')[] = [];
  let prev = 0;
  for (const p of visiblePages) {
    if (prev && p - prev > 1) withEllipsis.push('...');
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {total}
      </span>

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹ Previous
      </button>

      {withEllipsis.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 12 }}>…</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn${page === p ? ' active' : ''}`}
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next ›
      </button>
    </div>
  );
}
