'use client';

import { useEffect } from 'react';
import { useBreadcrumb, Crumb } from '@/lib/breadcrumb-context';

export function useSetBreadcrumbs(crumbs: Crumb[], deps: unknown[] = []) {
  const { setCrumbs } = useBreadcrumb();
  useEffect(() => {
    setCrumbs(crumbs);
    
    return () => setCrumbs([]);
    
  }, deps);
}
