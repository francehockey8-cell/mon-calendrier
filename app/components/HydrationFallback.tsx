'use client';

import { useEffect } from 'react';

export default function HydrationFallback() {
  useEffect(() => {
    document.body.dataset.hydrated = 'true';
  }, []);

  return null;
}