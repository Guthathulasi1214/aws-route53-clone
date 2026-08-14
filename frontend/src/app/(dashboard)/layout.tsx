'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BreadcrumbProvider } from '@/lib/breadcrumb-context';
import { Sidebar } from '@/components/layout/Sidebar';
import { SecondaryNav } from '@/components/layout/SecondaryNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-page)',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

    return (
    <BreadcrumbProvider>
      <div className="app-shell-outer">
        <SecondaryNav
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />
        <div className="app-shell-inner">
          <Sidebar isOpen={sidebarOpen} />
          <main className="app-content" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
