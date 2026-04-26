'use client';

import React from 'react';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/Button/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: 'var(--spacing-xxl) var(--spacing-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '2rem' }}>Something went wrong!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error.message || "Failed to load the page."}</p>
        <Button variant="outline" onClick={() => reset()}>Try again</Button>
      </main>
      <Footer />
    </div>
  );
}
