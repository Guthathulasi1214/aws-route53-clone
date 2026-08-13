'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hostedZonesService } from '@/services/hostedZones';
import { HostedZone, HostedZoneCreate, HostedZoneUpdate } from '@/types';
import { HostedZoneForm } from '@/components/hosted-zones/HostedZoneForm';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api';
import { useSetBreadcrumbs } from '@/hooks/useSetBreadcrumbs';

const PAGE_SIZE = 10;

export default function HostedZonesPage() {
  useSetBreadcrumbs([{ label: 'Hosted zones' }]);

  const { showToast } = useToast();
  const router = useRouter();

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Row selection — single row selection like AWS console
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedZone = zones.find((z) => z.id === selectedId) ?? null;

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchZones = useCallback(async (p = page, s = search) => {
    setIsLoading(true);
    setError('');
    try {
      const resp = await hostedZonesService.list({
        search: s || undefined,
        page: p,
        page_size: PAGE_SIZE,
      });
      setZones(resp.items);
      setTotal(resp.total);
      // Clear selection if selected zone no longer in list.
      setSelectedId((prev) =>
        prev !== null && resp.items.some((z) => z.id === prev) ? prev : null
      );
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  // Reset pagination when search changes.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleCreate = async (data: HostedZoneCreate | HostedZoneUpdate) => {
    setIsSubmitting(true);
    try {
      await hostedZonesService.create(data as HostedZoneCreate);
      showToast('Hosted zone created successfully.');
      setShowCreate(false);
      setPage(1);
      fetchZones(1, search);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: HostedZoneCreate | HostedZoneUpdate) => {
    if (!selectedZone) return;
    setIsSubmitting(true);
    try {
      await hostedZonesService.update(selectedZone.id, data as HostedZoneUpdate);
      showToast('Hosted zone updated successfully.');
      setShowEdit(false);
      fetchZones();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedZone) return;
    setIsSubmitting(true);
    try {
      await hostedZonesService.delete(selectedZone.id);
      showToast(`Hosted zone "${selectedZone.name}" deleted.`);
      setShowDelete(false);
      setSelectedId(null);
      setPage(1);
      fetchZones(1, search);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRow = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // Build a zero-padded fake hosted zone ID like AWS.
  const fakeZoneId = (id: number) => `Z${String(id).padStart(13, '0')}`;

  return (
    <>
      {/* Title row + action toolbar */}
      <div className="page-title-row">
        <h1 className="page-title">
          Hosted zones
          <span className="page-title-count" style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 18 }}>
            {!isLoading && ` (${total})`}
          </span>
        </h1>

        {/* AWS-style toolbar: refresh | View details | Edit | Delete | Create hosted zone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn-icon"
            onClick={() => fetchZones()}
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshIcon />
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={!selectedId}
            onClick={() => selectedZone && router.push(`/hosted-zones/${selectedZone.id}`)}
            id="view-details-btn"
          >
            View details
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={!selectedId}
            onClick={() => setShowEdit(true)}
            id="edit-zone-btn"
          >
            Edit
          </button>

          <button
            className="btn btn-secondary btn-sm"
            disabled={!selectedId}
            onClick={() => setShowDelete(true)}
            id="delete-zone-btn"
          >
            Delete
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreate(true)}
            id="create-zone-btn"
            style={{ marginLeft: 8 }}
          >
            Create hosted zone
          </button>
        </div>
      </div>

      {/* Table panel */}
      <div className="table-panel">
        {/* Search + mini pagination row */}
        <div className="table-search-row">
          <div className="search-wrapper">
            <SearchIcon />
            <input
              id="zones-search"
              type="search"
              className="search-input"
              placeholder="Filter records by property or value"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search hosted zones"
            />
          </div>
          <div className="mini-pagination">
            <button
              className="mini-page-btn"
              onClick={() => { const p = page - 1; setPage(p); fetchZones(p, search); }}
              disabled={page <= 1}
              aria-label="Previous page"
            >‹</button>
            <span className="mini-page-num">{total === 0 ? 0 : page}</span>
            <button
              className="mini-page-btn"
              onClick={() => { const p = page + 1; setPage(p); fetchZones(p, search); }}
              disabled={page >= totalPages}
              aria-label="Next page"
            >›</button>
          </div>
        </div>

        {/* Table */}
        <div className="table-overflow">
          {isLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading hosted zones...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-red)', fontWeight: 600, marginBottom: 6 }}>Unable to load hosted zones</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{error}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => fetchZones()}>Retry</button>
            </div>
          ) : zones.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {search ? `No results for "${search}"` : 'No hosted zones'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {search ? 'Try a different search term.' : 'Create a hosted zone to start routing traffic.'}
              </div>
              {!search && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                  Create hosted zone
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="th-check">
                    {/* AWS uses radio-style single selection, not select-all */}
                  </th>
                  <th>Hosted zone name</th>
                  <th>Type</th>
                  <th>Created by</th>
                  <th>Record count</th>
                  <th>Description</th>
                  <th>Hosted zone ID</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr
                    key={zone.id}
                    className={selectedId === zone.id ? 'row-selected' : ''}
                    onClick={() => toggleRow(zone.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="td-check">
                      <input
                        type="radio"
                        className="row-check"
                        checked={selectedId === zone.id}
                        onChange={() => toggleRow(zone.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${zone.name}`}
                        id={`select-zone-${zone.id}`}
                      />
                    </td>
                    <td>
                      <Link
                        href={`/hosted-zones/${zone.id}`}
                        className="table-link"
                        onClick={(e) => e.stopPropagation()}
                        id={`zone-link-${zone.id}`}
                      >
                        {zone.name}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge badge-${zone.zone_type}`}>
                        {zone.zone_type === 'public' ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>Route 53</td>
                    <td>{zone.record_count}</td>
                    <td
                      className="truncate"
                      style={{ maxWidth: 200, color: 'var(--text-secondary)' }}
                      title={zone.description || undefined}
                    >
                      {zone.description || '—'}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {fakeZoneId(zone.id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom pagination info */}
        {!isLoading && total > 0 && (
          <div className="pagination-bar">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="mini-pagination">
              <button
                className="mini-page-btn"
                onClick={() => { const p = page - 1; setPage(p); fetchZones(p, search); }}
                disabled={page <= 1}
                aria-label="Previous"
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span style={{ padding: '0 2px', fontSize: 12, color: 'var(--text-muted)' }}>…</span>
                    )}
                    <button
                      className={`mini-page-btn${page === p ? ' active' : ''}`}
                      style={page === p ? { background: 'var(--aws-navy)', color: 'white', borderColor: 'var(--aws-navy)' } : {}}
                      onClick={() => { setPage(p); fetchZones(p, search); }}
                      aria-label={`Page ${p}`}
                    >{p}</button>
                  </React.Fragment>
                ))}
              <button
                className="mini-page-btn"
                onClick={() => { const p = page + 1; setPage(p); fetchZones(p, search); }}
                disabled={page >= totalPages}
                aria-label="Next"
              >›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <HostedZoneForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          isLoading={isSubmitting}
        />
      )}
      {showEdit && selectedZone && (
        <HostedZoneForm
          zone={selectedZone}
          onSubmit={handleEdit}
          onCancel={() => setShowEdit(false)}
          isLoading={isSubmitting}
        />
      )}
      {showDelete && selectedZone && (
        <ConfirmDelete
          title="Delete hosted zone"
          message="Are you sure you want to delete this hosted zone? All DNS records in this zone will also be permanently deleted."
          itemName={selectedZone.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style={{ width: 14, height: 14 }}>
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  );
}
