'use client';

import React from 'react';

interface ConfirmDeleteProps {
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDelete({
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal modal-sm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="confirm-delete-title">{title}</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
            {message}
          </p>
          <div
            style={{
              background: '#f8f9fa',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '7px 12px',
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'var(--text-primary)',
              wordBreak: 'break-all',
            }}
          >
            {itemName}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading} id="confirm-delete-btn">
            {isLoading ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                Deleting...
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
