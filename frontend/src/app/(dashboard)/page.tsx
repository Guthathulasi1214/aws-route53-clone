'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { hostedZonesService } from '@/services/hostedZones';
import { HostedZone } from '@/types';
import { getErrorMessage } from '@/lib/api';
import { useSetBreadcrumbs } from '@/hooks/useSetBreadcrumbs';

export default function DashboardPage() {
  useSetBreadcrumbs([{ label: 'Dashboard' }]);

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [totalZones, setTotalZones] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const resp = await hostedZonesService.list({ page_size: 5 });
        setZones(resp.items);
        setTotalZones(resp.total);
        setTotalRecords(resp.items.reduce((sum, z) => sum + z.record_count, 0));
      } catch (e) {
        setError(getErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">Dashboard</h1>
        <Link href="/hosted-zones" className="btn btn-primary btn-sm" id="dashboard-create-zone">
          Create hosted zone
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">
            {isLoading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : totalZones}
          </div>
          <div className="stat-label">Hosted Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {isLoading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : totalRecords}
          </div>
          <div className="stat-label">DNS Records</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-green)', fontSize: 16, fontWeight: 600, marginTop: 6 }}>
            Available
          </div>
          <div className="stat-label">Service Status</div>
        </div>
      </div>

      {/* Recent zones */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Recent hosted zones</div>
        <Link href="/hosted-zones" className="btn btn-secondary btn-sm" id="dashboard-view-zones">
          View all
        </Link>
      </div>

      <div className="table-panel">
        {isLoading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--color-red)', fontSize: 13 }}>
            {error}
          </div>
        ) : zones.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No hosted zones</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Create your first hosted zone to start managing DNS records.
            </div>
            <Link href="/hosted-zones" className="btn btn-primary btn-sm">
              Create hosted zone
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Hosted zone name</th>
                <th>Type</th>
                <th>Record count</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td>
                    <Link href={`/hosted-zones/${zone.id}`} className="table-link">
                      {zone.name}
                    </Link>
                  </td>
                  <td>
                    <span className={`badge badge-${zone.zone_type}`}>
                      {zone.zone_type === 'public' ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td>{zone.record_count}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {new Date(zone.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
