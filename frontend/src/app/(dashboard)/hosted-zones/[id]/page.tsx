'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hostedZonesService } from '@/services/hostedZones';
import { recordsService } from '@/services/records';
import { HostedZone, HostedZoneUpdate, DnsRecord, DnsRecordCreate, DnsRecordUpdate, RECORD_TYPES } from '@/types';
import { RecordForm } from '@/components/records/RecordForm';
import { HostedZoneForm } from '@/components/hosted-zones/HostedZoneForm';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api';
import { useSetBreadcrumbs } from '@/hooks/useSetBreadcrumbs';

const PAGE_SIZE = 10;

export default function ZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = Number(params.id);
  const { showToast } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  
  useSetBreadcrumbs(
    [
      { label: 'Hosted zones', href: '/hosted-zones' },
      { label: zone?.name ?? '...' },
    ],
    [zone?.name],
  );

  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoadingZone, setIsLoadingZone] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [zoneError, setZoneError] = useState('');
  const [recordsError, setRecordsError] = useState('');

  // Record row selection — single selection.
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const selectedRecord = records.find((r) => r.id === selectedRecordId) ?? null;

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zone-level edit modal (separate from record edit)
  const [showEditZone, setShowEditZone] = useState(false);
  // Zone-level delete modal (separate from record delete)
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  useEffect(() => {
    async function loadZone() {
      try {
        const z = await hostedZonesService.get(zoneId);
        setZone(z);
      } catch (e) {
        setZoneError(getErrorMessage(e));
      } finally {
        setIsLoadingZone(false);
      }
    }
    if (zoneId) loadZone();
  }, [zoneId]);

  const fetchRecords = useCallback(async (p = page, s = search, t = typeFilter) => {
    if (!zoneId) return;
    setIsLoadingRecords(true);
    setRecordsError('');
    try {
      const resp = await recordsService.list(zoneId, {
        search: s || undefined,
        type: t || undefined,
        page: p,
        page_size: PAGE_SIZE,
      });
      setRecords(resp.items);
      setTotal(resp.total);
      setSelectedRecordId((prev) =>
        prev !== null && resp.items.some((r) => r.id === prev) ? prev : null
      );
    } catch (e) {
      setRecordsError(getErrorMessage(e));
    } finally {
      setIsLoadingRecords(false);
    }
  }, [zoneId, page, search, typeFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  // Reset pagination when search changes.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleTypeFilter = (t: string) => {
    setTypeFilter(t);
    setPage(1);
    fetchRecords(1, search, t);
  };

  const refreshZone = async () => {
    try {
      const z = await hostedZonesService.get(zoneId);
      setZone(z);
    } catch { /* ignore */ }
  };

  const handleEditZone = async (data: HostedZoneUpdate) => {
    setIsSubmitting(true);
    try {
      const updated = await hostedZonesService.update(zoneId, data);
      setZone(updated);
      showToast('Hosted zone updated successfully.');
      setShowEditZone(false);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async () => {
    setIsSubmitting(true);
    try {
      await hostedZonesService.delete(zoneId);
      showToast(`Hosted zone "${zone?.name}" deleted.`);
      router.push('/hosted-zones');
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
      setShowDeleteZone(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRecord = async (data: DnsRecordCreate | DnsRecordUpdate) => {
    setIsSubmitting(true);
    try {
      await recordsService.create(zoneId, data as DnsRecordCreate);
      showToast('Record created successfully.');
      setShowCreate(false);
      setPage(1);
      fetchRecords(1, search, typeFilter);
      refreshZone();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = async (data: DnsRecordCreate | DnsRecordUpdate) => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      await recordsService.update(selectedRecord.id, data as DnsRecordUpdate);
      showToast('Record updated successfully.');
      setShowEdit(false);
      fetchRecords();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    try {
      await recordsService.delete(selectedRecord.id);
      showToast('Record deleted.');
      setShowDelete(false);
      setSelectedRecordId(null);
      setPage(1);
      fetchRecords(1, search, typeFilter);
      refreshZone();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (isLoadingZone) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 10px' }} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (zoneError) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-red)', fontWeight: 600, marginBottom: 8 }}>Unable to load hosted zone</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{zoneError}</div>
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>Go back</button>
      </div>
    );
  }

  return (
    <>
      {}
      <div className="page-title-row">
        <h1 className="page-title">{zone?.name}</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDeleteZone(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {}
      <div className="section-panel">
        <div
          className="section-panel-header"
          onClick={() => setDetailsOpen((o) => !o)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setDetailsOpen((o) => !o)}
          aria-expanded={detailsOpen}
        >
          <div className="section-panel-title">
            <span className={`section-panel-toggle${detailsOpen ? ' open' : ''}`}>▶</span>
            Hosted zone details
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditZone(true);
            }}
            style={{ marginLeft: 'auto' }}
          >
            Edit
          </button>
        </div>
        {detailsOpen && zone && (
          <div className="section-panel-body">
            <div className="detail-grid">
              <div>
                <div className="detail-item-label">Hosted zone ID</div>
                <div className="detail-item-value text-mono" style={{ fontSize: 12 }}>
                  Z{String(zone.id).padStart(13, '0')}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Type</div>
                <div className="detail-item-value">
                  {zone.zone_type === 'public' ? 'Public hosted zone' : 'Private hosted zone'}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Record count</div>
                <div className="detail-item-value">{zone.record_count}</div>
              </div>
              <div>
                <div className="detail-item-label">Created</div>
                <div className="detail-item-value">
                  {new Date(zone.created_at).toLocaleDateString()}
                </div>
              </div>
              {zone.description && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="detail-item-label">Description</div>
                  <div className="detail-item-value">{zone.description}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {}
      <div className="table-panel">
        {}
        <div className="records-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              className="btn-icon"
              onClick={() => fetchRecords()}
              title="Refresh"
              aria-label="Refresh records"
            >
              <RefreshIcon />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!selectedRecordId}
              onClick={() => setShowEdit(true)}
              id="edit-record-btn"
            >
              Edit
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={!selectedRecordId}
              onClick={() => setShowDelete(true)}
              id="delete-record-btn"
            >
              Delete
            </button>
          </div>
          <div className="records-toolbar-right">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowCreate(true)}
              id="create-record-btn"
            >
              Create record
            </button>
          </div>
        </div>

        {}
        <div style={{ padding: '6px 16px 4px', fontSize: 12, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)', background: 'var(--bg-white)' }}>
          {zone && `The following table lists the existing records in ${zone.name}.`}
        </div>

        {}
        <div className="table-search-row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="search-wrapper" style={{ flex: '1 1 200px', minWidth: 160 }}>
            <SearchIcon />
            <input
              id="records-search"
              type="search"
              className="search-input"
              placeholder="Filter records by property or value"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search DNS records"
            />
          </div>

          <div className="filter-tabs" role="group" aria-label="Filter by type">
            <button
              className={`filter-tab ${typeFilter === '' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('')}
            >All</button>
            {RECORD_TYPES.map((t) => (
              <button
                key={t}
                className={`filter-tab ${typeFilter === t ? 'active' : ''}`}
                onClick={() => handleTypeFilter(t)}
                id={`filter-${t}`}
              >{t}</button>
            ))}
          </div>

          <div className="mini-pagination">
            <button
              className="mini-page-btn"
              onClick={() => { const p = page - 1; setPage(p); fetchRecords(p, search, typeFilter); }}
              disabled={page <= 1}
            >‹</button>
            <span className="mini-page-num">{total === 0 ? 0 : page}</span>
            <button
              className="mini-page-btn"
              onClick={() => { const p = page + 1; setPage(p); fetchRecords(p, search, typeFilter); }}
              disabled={page >= totalPages}
            >›</button>
          </div>
        </div>

        {/* Records table */}
        <div className="table-overflow">
          {isLoadingRecords ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading records...</div>
            </div>
          ) : recordsError ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-red)', fontWeight: 600, marginBottom: 6 }}>Unable to load records</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{recordsError}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => fetchRecords()}>Retry</button>
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                {search || typeFilter ? 'No matching records' : 'No DNS records'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {search || typeFilter ? 'Try clearing filters.' : 'Create your first DNS record for this zone.'}
              </div>
              {!search && !typeFilter && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                  Create record
                </button>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="th-check"></th>
                  <th>Record name</th>
                  <th>Type</th>
                  <th>Routing policy</th>
                  <th>Alias</th>
                  <th>Value / Route traffic to</th>
                  <th>TTL (seconds)</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className={selectedRecordId === record.id ? 'row-selected' : ''}
                    onClick={() => setSelectedRecordId((p) => p === record.id ? null : record.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="td-check">
                      <input
                        type="radio"
                        className="row-check"
                        checked={selectedRecordId === record.id}
                        onChange={() => setSelectedRecordId((p) => p === record.id ? null : record.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${record.name}`}
                        id={`select-record-${record.id}`}
                      />
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{record.name}</td>
                    <td>
                      <span className="badge-record-type">{record.type}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {record.routing_policy}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>No</td>
                    <td style={{ maxWidth: 280 }}>
                      <span
                        style={{
                          display: 'block',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 260,
                        }}
                        title={record.value}
                      >
                        {record.value}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{record.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {}
        {!isLoadingRecords && total > 0 && (
          <div className="pagination-bar">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="mini-pagination">
              <button
                className="mini-page-btn"
                onClick={() => { const p = page - 1; setPage(p); fetchRecords(p, search, typeFilter); }}
                disabled={page <= 1}
              >‹</button>
              <span className="mini-page-num">{page}</span>
              <button
                className="mini-page-btn"
                onClick={() => { const p = page + 1; setPage(p); fetchRecords(p, search, typeFilter); }}
                disabled={page >= totalPages}
              >›</button>
            </div>
          </div>
        )}
      </div>

      {}
      {showCreate && (
        <RecordForm
          zoneId={zoneId}
          zoneName={zone?.name}
          onSubmit={handleCreateRecord}
          onCancel={() => setShowCreate(false)}
          isLoading={isSubmitting}
        />
      )}
      {showEdit && selectedRecord && (
        <RecordForm
          record={selectedRecord}
          zoneName={zone?.name}
          onSubmit={handleEditRecord}
          onCancel={() => setShowEdit(false)}
          isLoading={isSubmitting}
        />
      )}
      {showDelete && selectedRecord && (
        <ConfirmDelete
          title="Delete record"
          message="Are you sure you want to delete this DNS record? This action cannot be undone."
          itemName={`${selectedRecord.name} (${selectedRecord.type})`}
          onConfirm={handleDeleteRecord}
          onCancel={() => setShowDelete(false)}
          isLoading={isSubmitting}
        />
      )}
      {showEditZone && zone && (
        <HostedZoneForm
          zone={zone}
          onSubmit={(data) => handleEditZone(data as HostedZoneUpdate)}
          onCancel={() => setShowEditZone(false)}
          isLoading={isSubmitting}
        />
      )}
      {showDeleteZone && zone && (
        <ConfirmDelete
          title="Delete hosted zone"
          message={`Are you sure you want to delete "${zone.name}"? All DNS records in this zone will also be permanently deleted. This action cannot be undone.`}
          itemName={zone.name}
          onConfirm={handleDeleteZone}
          onCancel={() => setShowDeleteZone(false)}
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
    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }} aria-hidden="true">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  );
}
