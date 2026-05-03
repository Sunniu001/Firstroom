'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WCOrder } from '@/lib/api/auth';
import styles from './ThankYouPage.module.css';

function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get('order_id');
  const [order, setOrder] = useState<WCOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/wc/orders?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return <div className={styles.container} style={{ textAlign: 'center' }}>Loading your order details...</div>;
  }

  return (
    <div style={{ width: '100%', paddingTop: '5rem' }}>
      <div className={styles.container}>
        <div className={styles.successHeader}>
          <div className={styles.iconWrapper}>
            <img src="/images/Order%20Placed.png" alt="Order Placed" className={styles.iconImage} />
          </div>
          <h1 className={styles.title}>Order Confirmed!</h1>
          <p className={styles.subtitle}>
            You will get your order within 5-7 days. 
            {orderId && <span> Your Order ID is #{orderId}</span>}
          </p>
        </div>

      {order && (
        <div className={styles.orderCard}>
          <button className={styles.accordionToggle} onClick={() => setIsOpen(!isOpen)}>
            <span className={styles.toggleLabel}>
              Order Summary {orderId && `(#${orderId})`}
            </span>
            <span className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconOpen : ''}`}>
              ▼
            </span>
          </button>

          <div className={`${styles.accordionContent} ${isOpen ? styles.accordionOpen : ''}`}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.orderId}>ORDER #{order.id}</div>
                <div className={styles.orderDate}>{new Date(order.date_created).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#777', textTransform: 'uppercase', marginBottom: '4px' }}>Status</div>
                <div style={{ fontWeight: 600, color: '#a67b45' }}>{order.status.toUpperCase()}</div>
              </div>
            </div>

            <div className={styles.itemsList}>
              {order.line_items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  {item.image?.src && (
                    <img src={item.image.src} alt={item.name} className={styles.itemImage} />
                  )}
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.meta_data && item.meta_data.length > 0 && (
                      <div className={styles.itemMeta}>
                        {item.meta_data
                          .filter(m => !['area', '_custom_data', 'sqft'].includes(m.key.toLowerCase()))
                          .map((m, i, arr) => (
                            <span key={i}>{m.key}: {m.value}{i < arr.length - 1 ? ' • ' : ''}</span>
                          ))}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#777', marginTop: '4px' }}>Qty: {item.quantity}</div>
                  </div>
                  <div className={styles.itemPrice}>
                    {order.currency_symbol}{parseFloat(item.total).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{order.currency_symbol}{parseFloat(order.total).toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                <span>Total Paid</span>
                <span>{order.currency_symbol}{parseFloat(order.total).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Review Section */}
      <div className={styles.reviewSection}>
        <h2 className={styles.reviewTitle}>Love your new space?</h2>
        <p className={styles.reviewSubtitle}>Share your experience with us on Google Reviews!</p>
        
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star} 
              className={`${styles.star} ${rating >= star ? styles.starActive : ''}`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <a 
            href="https://maps.app.goo.gl/hUF7xsJ2qJiXnEFw8" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.submitBtn}
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            WRITE A GOOGLE REVIEW
          </a>
        </div>
      </div>

      <div className={styles.actions}>
        <Link href="/" className={styles.secondaryBtn}>
          CONTINUE SHOPPING
        </Link>
        <Link href="/account?section=orders" className={styles.primaryBtn}>
          TRACK ORDER
        </Link>
      </div>
      </div>
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
