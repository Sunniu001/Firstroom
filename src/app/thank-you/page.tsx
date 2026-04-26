'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <div style={{
      maxWidth: '600px', margin: '0 auto', padding: '8rem 1.5rem',
      textAlign: 'center', fontFamily: 'var(--font-sans)'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✅</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 500, marginBottom: '1rem' }}>
        Order Placed!
      </h1>
      {orderId && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Order #{orderId}
        </p>
      )}
      <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: 1.6 }}>
        Thank you for your order. We&apos;ve received it and will begin processing soon.
        You&apos;ll receive a confirmation email shortly.
      </p>
      <Link href="/" style={{
        display: 'inline-block', background: '#111', color: '#fff',
        padding: '1rem 2.5rem', letterSpacing: '1.5px', fontSize: '0.88rem', fontWeight: 600,
        textDecoration: 'none'
      }}>
        CONTINUE SHOPPING
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense>
      <ThankYouContent />
    </Suspense>
  );
}
