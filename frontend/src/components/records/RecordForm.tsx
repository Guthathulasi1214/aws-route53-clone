'use client';

import React, { useState } from 'react';
import { DnsRecord, DnsRecordCreate, DnsRecordUpdate, RECORD_TYPES, ROUTING_POLICIES, RecordType, RoutingPolicy } from '@/types';

interface RecordFormProps {
  record?: DnsRecord;
  zoneId?: number;
  zoneName?: string;
  onSubmit: (data: DnsRecordCreate | DnsRecordUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TTL_PRESETS = [
  { label: '1m', value: 60 },
  { label: '1h', value: 3600 },
  { label: '1d', value: 86400 },
];

const VALUE_PLACEHOLDER: Record<RecordType, string> = {
  A:     '93.184.216.34',
  AAAA:  '2606:2800:220:1:248:1893:25c8:1946',
  CNAME: 'www.example.com',
  MX:    '10 mail.example.com.',
  TXT:   '"v=spf1 include:_spf.google.com ~all"',
  NS:    'ns1.example.com.',
  PTR:   'example.com.',
  SRV:   '10 20 5060 sipserver.example.com.',
  CAA:   '0 issue "letsencrypt.org"',
};

const TYPE_DESCRIPTION: Record<RecordType, string> = {
  A:     'A – Routes traffic to an IPv4 address',
  AAAA:  'AAAA – Routes traffic to an IPv6 address',
  CNAME: 'CNAME – Routes traffic to another domain name',
  MX:    'MX – Routes traffic to mail servers',
  TXT:   'TXT – Verifies email senders and application-specific values',
  NS:    'NS – Identifies name servers for the hosted zone',
  PTR:   'PTR – Maps an IP address to a domain name',
  SRV:   'SRV – Defines service location for protocols',
  CAA:   'CAA – Specifies which CAs are allowed to issue SSL/TLS certs',
};

export function RecordForm({ record, zoneName, onSubmit, onCancel, isLoading = false }: RecordFormProps) {
  const isEditing = !!record;

  const [name, setName] = useState(record?.name ?? '');
  const [type, setType] = useState<RecordType>(record?.type ?? 'A');
  const [ttl, setTtl] = useState(String(record?.ttl ?? 300));
  const [value, setValue] = useState(record?.value ?? '');
  const [routingPolicy, setRoutingPolicy] = useState<RoutingPolicy>(record?.routing_policy ?? 'simple');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Record name is required.';
    const ttlNum = Number(ttl);
    if (ttl === '' || isNaN(ttlNum) || ttlNum < 0) errs.ttl = 'TTL must be 0 or a positive number.';
    if (!value.trim()) errs.value = 'Value is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      name: name.trim(),
      type,
      ttl: Number(ttl),
      value: value.trim(),
      routing_policy: routingPolicy,
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-form-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="record-form-title">
            {isEditing ? 'Edit record' : 'Create record'}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ padding: 0 }}>

            {/* Quick create record panel */}
            <div className="form-panel" style={{ margin: '16px 20px 0', borderRadius: 'var(--radius)' }}>
              <div className="form-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Quick create record</span>
              </div>
              <div className="form-panel-body">

                {/* Record name + type — side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="record-name">
                      Record name
                      <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <input
                        id="record-name"
                        type="text"
                        className={`form-input${errors.name ? ' error' : ''}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="subdomain"
                        disabled={isLoading}
                        autoFocus
                        style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', flex: 1 }}
                      />
                      {zoneName && (
                        <span style={{
                          padding: '6px 10px',
                          border: '1px solid var(--border-input)',
                          borderLeft: 'none',
                          borderRadius: '0 var(--radius) var(--radius) 0',
                          background: '#f8f9fa',
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          .{zoneName}
                        </span>
                      )}
                    </div>
                    <div className="form-hint">Keep blank to create a record for the root domain.</div>
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="record-type">
                      Record type
                      <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                    </label>
                    <select
                      id="record-type"
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value as RecordType)}
                      disabled={isLoading}
                    >
                      {RECORD_TYPES.map((t) => (
                        <option key={t} value={t}>{TYPE_DESCRIPTION[t]}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Value */}
                <div className="form-group">
                  <label className="form-label" htmlFor="record-value">
                    Value
                    <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                  </label>
                  <textarea
                    id="record-value"
                    className={`form-textarea${errors.value ? ' error' : ''}`}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={VALUE_PLACEHOLDER[type]}
                    rows={3}
                    disabled={isLoading}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <div className="form-hint">Enter multiple values on separate lines.</div>
                  {errors.value && <div className="form-error">{errors.value}</div>}
                </div>

                {/* TTL + Routing policy — side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="record-ttl">
                      TTL (seconds)
                      <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                    </label>
                    <div className="ttl-presets">
                      <input
                        id="record-ttl"
                        type="number"
                        className={`form-input ttl-input${errors.ttl ? ' error' : ''}`}
                        value={ttl}
                        onChange={(e) => setTtl(e.target.value)}
                        min={0}
                        disabled={isLoading}
                      />
                      {TTL_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          className={`ttl-btn${Number(ttl) === p.value ? ' active' : ''}`}
                          onClick={() => setTtl(String(p.value))}
                          disabled={isLoading}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="form-hint">Recommended values: 60 to 172800 (two days)</div>
                    {errors.ttl && <div className="form-error">{errors.ttl}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="record-routing">
                      Routing policy
                      <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                    </label>
                    <select
                      id="record-routing"
                      className="form-select"
                      value={routingPolicy}
                      onChange={(e) => setRoutingPolicy(e.target.value as RoutingPolicy)}
                      disabled={isLoading}
                    >
                      {ROUTING_POLICIES.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)} routing
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ height: 16 }} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Save changes' : 'Create records'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
