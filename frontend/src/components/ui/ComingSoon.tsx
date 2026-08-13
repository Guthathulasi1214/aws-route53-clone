'use client';

interface ComingSoonProps {
  title: string;
  description: string;
}

function ComingSoonPage({ title, description }: ComingSoonProps) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, color: 'var(--text-primary)' }}>{title}</h1>
      </div>
      <div className="coming-soon-panel">
        <div className="coming-soon-title">Not implemented</div>
        <p className="coming-soon-desc">{description}</p>
        <span className="coming-soon-label">
          This feature is not available in this Route 53 clone
        </span>
      </div>
    </div>
  );
}

export function TrafficPoliciesPage() {
  return (
    <ComingSoonPage
      title="Traffic policies"
      description="Traffic policies let you create routing configurations using weighted, failover, latency-based, geolocation, and geoproximity routing."
    />
  );
}

export function HealthChecksPage() {
  return (
    <ComingSoonPage
      title="Health checks"
      description="Route 53 health checks monitor the health and performance of your web application, web servers, and other resources."
    />
  );
}

export function ResolverPage() {
  return (
    <ComingSoonPage
      title="Resolver"
      description="Route 53 Resolver provides recursive DNS for your Amazon VPCs and allows you to configure forwarding rules for DNS queries."
    />
  );
}

export function ProfilesPage() {
  return (
    <ComingSoonPage
      title="Profiles"
      description="Route 53 Profiles allow you to apply consistent DNS configurations across multiple VPCs and AWS accounts."
    />
  );
}
