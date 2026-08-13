'use client';

import { useEffect } from 'react';
import { useBreadcrumb, Crumb } from '@/lib/breadcrumb-context';

/**
 * Convenience hook: call this once per page to set its breadcrumb.
 * The deps array works exactly like useEffect — pass values that determine
 * the crumbs so they update when the data is ready (e.g. after zone fetch).
 *
 * This does NOT fetch any data — it just writes to the BreadcrumbContext.
 */
export function useSetBreadcrumbs(crumbs: Crumb[], deps: unknown[] = []) {
  const { setCrumbs } = useBreadcrumb();
  useEffect(() => {
    setCrumbs(crumbs);
    // Clear crumbs on unmount so navigation to another page starts fresh.
    return () => setCrumbs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
