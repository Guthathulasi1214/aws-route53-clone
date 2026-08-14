'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/api';

interface SidebarProps {
  isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
  const pathname = usePathname();
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

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`app-sidebar${isOpen ? '' : ' app-sidebar--collapsed'}`}
      aria-label="Main navigation"
      aria-hidden={!isOpen}
    >

      {}
      <div className="sidebar-section">
        <Link href="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
          Dashboard
        </Link>
        <Link href="/hosted-zones" className={`sidebar-link ${isActive('/hosted-zones') ? 'active' : ''}`}>
          Hosted zones
        </Link>
        <Link href="/health-checks" className={`sidebar-link ${isActive('/health-checks') ? 'active' : ''}`}>
          Health checks
        </Link>
        <span className="sidebar-link" style={{ cursor: 'default' }}>
          Profiles <span className="sidebar-badge-new">New</span>
        </span>
      </div>

      {}
      <div className="sidebar-section">
        <div className="sidebar-category">Traffic flow</div>
        <Link href="/traffic-policies" className={`sidebar-link ${isActive('/traffic-policies') ? 'active' : ''}`}>
          Traffic policies
        </Link>
      </div>

      {}
      <div className="sidebar-section">
        <div className="sidebar-category">Resolver</div>
        <Link href="/resolver" className={`sidebar-link ${isActive('/resolver') ? 'active' : ''}`}>
          VPCs
        </Link>
        <Link href="/profiles" className={`sidebar-link ${isActive('/profiles') ? 'active' : ''}`}>
          Profiles
        </Link>
      </div>

      {}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user-label" title={user.email}>
            {user.email}
          </div>
        )}
        <button className="sidebar-link" onClick={handleLogout} aria-label="Sign out">
          <SignOutIcon />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3v-1.5H4V3.5h2V2zm7 6l-4-4v2.5H6v3h3V12l4-4z" />
    </svg>
  );
}
