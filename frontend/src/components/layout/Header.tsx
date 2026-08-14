'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  breadcrumbs?: { label: string }[];
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'U';

  return (
    <header className="app-header" role="banner">
      {}
      <svg width="32" height="20" viewBox="0 0 60 38" fill="none" style={{ flexShrink: 0, marginRight: 4 }}>
        <path d="M16.8 22.5c-.6.2-1.5.4-2.3.4-2.7 0-4.5-1.8-4.5-4.4 0-2.7 1.9-4.5 4.7-4.5.8 0 1.5.1 2.1.4l-.4 1.3c-.4-.2-1-.3-1.7-.3-1.9 0-3.1 1.2-3.1 3.1 0 1.9 1.2 3 3 3 .7 0 1.3-.1 1.8-.4l.4 1.4zm7.7.3h-1.6l-1.5-4.8c-.1-.4-.3-1-.4-1.8h0c-.1.7-.3 1.4-.4 1.8l-1.5 4.8H17.6l-2.4-7.6h1.7l1.3 4.6c.1.5.3 1.1.4 1.9h0c.1-.5.3-1.2.5-1.9l1.5-4.6h1.5l1.4 4.7c.2.6.4 1.2.4 1.8h0c.1-.6.3-1.3.4-1.9l1.3-4.6H27l-2.5 7.6z" fill="#FF9900"/>
        <path d="M30 25c-4 2.2-9.8 3.3-14.8 3.3-7 0-13.3-2.6-18-6.8-.4-.3 0-.7.4-.5 5.1 3 11.4 4.8 17.9 4.8 4.4 0 9.2-.9 13.6-2.8.7-.2 1.2.5.9.9v.1zm1.4-1.6c-.5-.6-3.3-.3-4.6-.1-.4 0-.4-.3-.1-.5 2.2-1.6 5.9-1.1 6.3-.6.4.5-.1 4.3-2.2 6.1-.3.3-.6.1-.5-.2.5-1.1 1.6-3.7 1.1-4.7z" fill="#FF9900"/>
      </svg>

      <div className="header-breadcrumb-area">
        <span className="header-crumb">Route 53</span>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            <span className="header-crumb-sep">›</span>
            <span className="header-crumb-active">{b.label}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="header-user-area">
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </span>
        <div className="header-avatar" title={user?.name ?? user?.email}>
          {initials}
        </div>
      </div>
    </header>
  );
}
