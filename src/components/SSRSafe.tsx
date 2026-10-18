'use client';

import React from 'react';

export function SSRSafe({ children }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <>{children}</>;
}
