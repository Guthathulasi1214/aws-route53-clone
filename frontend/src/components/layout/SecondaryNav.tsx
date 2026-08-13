'use client';

import React from 'react';
import Link from 'next/link';
import { useBreadcrumb } from '@/lib/breadcrumb-context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api';

/**
 * The secondary nav bar that visually matches the AWS Route 53 console:
 *
 *  ┌───────────────────┬──────────────────────────────────────────────────┐
 *  │  Route 53      ×  │  Route 53  ›  Hosted zones  ›  myaws.ga         │
 *  └───────────────────┴──────────────────────────────────────────────────┘
 *
 * Left panel (matches sidebar width): service name + collapse toggle.
 * Right panel: Route 53-prefixed breadcrumb from BreadcrumbContext.
 *
 * The × button collapses the sidebar; ☰ reopens it.
 * No routing, auth, or data logic is touched.
 */
interface SecondaryNavProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function SecondaryNav({ sidebarOpen, onToggleSidebar }: SecondaryNavProps) {
  const { crumbs } = useBreadcrumb();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
  };

  return (
    <div className="secondary-nav" role="navigation" aria-label="Service navigation">
      {/*
        LEFT PANEL — strict two-state:
          OPEN:   Route 53   [×]     ← no hamburger
          CLOSED: [☰]                ← no Route 53, no ×
      */}
      <div
        className="secondary-nav-brand"
        style={{
          width:    sidebarOpen ? 'var(--sidebar-w)' : 'auto',
          minWidth: sidebarOpen ? 'var(--sidebar-w)' : 0,
        }}
      >
        {sidebarOpen ? (
          /* OPEN STATE: Route 53 (left) + × (right) */
          <>
            <Link href="/" className="secondary-nav-service-name">
              Route 53
            </Link>
            <button
              className="secondary-nav-close-btn"
              aria-label="Close sidebar"
              title="Close sidebar"
              onClick={onToggleSidebar}
            >
              ×
            </button>
          </>
        ) : (
          /* CLOSED STATE: hamburger only */
          <button
            className="secondary-nav-menu-btn"
            aria-label="Open sidebar"
            title="Open sidebar"
            onClick={onToggleSidebar}
          >
            ☰
          </button>
        )}
      </div>

      {/* RIGHT: "Route 53 › Hosted zones › myaws.ga" */}
      <div className="secondary-nav-crumb" aria-label="Breadcrumb">
        <Link href="/" className="secondary-nav-crumb-link">Route 53</Link>

        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <span className="secondary-nav-crumb-sep" aria-hidden="true">›</span>
            {crumb.href ? (
              <Link href={crumb.href} className="secondary-nav-crumb-link">
                {crumb.label}
              </Link>
            ) : (
              <span className="secondary-nav-crumb-current">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* RIGHT end: user email + sign out */}
      {user && (
        <div className="secondary-nav-user">
          <span className="secondary-nav-user-email" title={user.email}>
            {user.email}
          </span>
          <button
            className="secondary-nav-signout"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
