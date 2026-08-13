'use client';

import React, { useState } from 'react';
import { HostedZone, HostedZoneCreate, HostedZoneUpdate } from '@/types';

interface HostedZoneFormProps {
  zone?: HostedZone;
  onSubmit: (data: HostedZoneCreate | HostedZoneUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function HostedZoneForm({ zone, onSubmit, onCancel, isLoading = false }: HostedZoneFormProps) {
  const isEditing = !!zone;
  const [name, setName] = useState(zone?.name ?? '');
  const [description, setDescription] = useState(zone?.description ?? '');
  const [zoneType, setZoneType] = useState<'public' | 'private'>(zone?.zone_type ?? 'public');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) {
      errs.name = 'Domain name is required.';
    } else if (!/^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/.test(trimmed)) {
      errs.name = 'Enter a valid domain name (e.g. example.com).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      name: name.trim().toLowerCase(),
      description: description.trim() || undefined,
      zone_type: zoneType,
      private_zone: zoneType === 'private',
    });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal modal-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zone-form-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="zone-form-title">
            {isEditing ? 'Edit hosted zone' : 'Create hosted zone'}
          </h2>
          <button className="modal-close" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body" style={{ padding: '0' }}>

            {/* Configuration panel */}
            <div className="form-panel" style={{ margin: '16px 20px 0', borderRadius: 'var(--radius)' }}>
              <div className="form-panel-header">Hosted zone configuration</div>
              <div className="form-panel-body">

                <div className="form-group">
                  <label className="form-label" htmlFor="zone-name">
                    Domain name
                    <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400, cursor: 'pointer' }}>Info</span>
                    {!isEditing && <span className="required" aria-hidden="true"> *</span>}
                  </label>
                  <div className="form-hint">This is the name of the domain that you want to route traffic for.</div>
                  <input
                    id="zone-name"
                    type="text"
                    className={`form-input${errors.name ? ' error' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="example.com"
                    disabled={isLoading || isEditing}
                    autoFocus
                    aria-required="true"
                    style={{ marginTop: 6 }}
                  />
                  <div className="form-hint" style={{ marginTop: 3 }}>
                    Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + , - / : ; &lt; = &gt; ? @ [ \ ] ^ _ ` {'{'} | {'}'} ~
                  </div>
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="zone-description">
                    Description{' '}
                    <span className="form-label-opt">- optional</span>
                    <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                  </label>
                  <div className="form-hint">This value lets you distinguish hosted zones that have the same name.</div>
                  <textarea
                    id="zone-description"
                    className="form-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="The hosted zone is used for..."
                    rows={3}
                    disabled={isLoading}
                    maxLength={256}
                    style={{ marginTop: 6 }}
                  />
                  <div className="form-hint">{description.length}/256</div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Type
                    <span style={{ fontSize: 11, color: 'var(--aws-blue)', marginLeft: 6, fontWeight: 400 }}>Info</span>
                  </label>
                  <div className="form-hint" style={{ marginBottom: 10 }}>
                    The type indicates whether you want to route traffic on the internet or in an Amazon VPC.
                  </div>
                  <div className="radio-cards">
                    <label
                      className={`radio-card ${zoneType === 'public' ? 'selected' : ''}`}
                      htmlFor="zone-type-public"
                    >
                      <input
                        id="zone-type-public"
                        type="radio"
                        name="zone_type"
                        value="public"
                        checked={zoneType === 'public'}
                        onChange={() => setZoneType('public')}
                        disabled={isLoading}
                      />
                      <div>
                        <div className="radio-card-title">Public hosted zone</div>
                        <div className="radio-card-desc">
                          A public hosted zone determines how traffic is routed on the internet.
                        </div>
                      </div>
                    </label>
                    <label
                      className={`radio-card ${zoneType === 'private' ? 'selected' : ''}`}
                      htmlFor="zone-type-private"
                    >
                      <input
                        id="zone-type-private"
                        type="radio"
                        name="zone_type"
                        value="private"
                        checked={zoneType === 'private'}
                        onChange={() => setZoneType('private')}
                        disabled={isLoading}
                      />
                      <div>
                        <div className="radio-card-title">Private hosted zone</div>
                        <div className="radio-card-desc">
                          A private hosted zone determines how traffic is routed within an Amazon VPC.
                        </div>
                      </div>
                    </label>
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
                isEditing ? 'Save changes' : 'Create hosted zone'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
