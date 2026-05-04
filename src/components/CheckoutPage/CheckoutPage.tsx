'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getCart, placeOrder, BillingDetails } from '@/lib/api/cart';
import styles from './CheckoutPage.module.css';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';


const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

const initialBilling: BillingDetails = {
  first_name: '', last_name: '', company: '',
  address_1: '', address_2: '',
  city: '', state: 'Jharkhand', postcode: '',
  country: 'IN', email: '', phone: '',
};

export const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const {
    cart, cartToken, setCart, setIsLoading, isLoading,
    selectedItemIds, clearSelection,
  } = useCartStore();
  const { user } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const [billing, setBilling] = useState<BillingDetails>(initialBilling);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate cart if needed
  useEffect(() => {
    if (cartToken && !cart) {
      const fetch = async () => {
        setIsLoading(true);
        try {
          const c = await getCart(cartToken);
          setCart(c);
        } finally {
          setIsLoading(false);
        }
      };
      fetch();
    }
  }, [cartToken, cart, setCart, setIsLoading]);

  // Compute selected items
  const selectedItems = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter(item => selectedItemIds.includes(item.id));
  }, [cart, selectedItemIds]);

  const subtotal = useMemo(() =>
    selectedItems.reduce((sum, item) => sum + parseFloat(item.price.amount) * item.quantity, 0),
    [selectedItems]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBilling(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (wcOrderId: number, amount: number) => {
    const res = await loadRazorpayScript();

    if (!res) {
      setError('Razorpay SDK failed to load. Please check your connection.');
      return;
    }

    try {
      // 1. Create Razorpay Order in our backend
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          receipt: `wc_order_${wcOrderId}`,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to initialize payment with Razorpay.');
      }

      const rzpOrder = await orderRes.json();

      // 2. Open Razorpay Modal
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'FirstRoom',
        description: `Order #${wcOrderId}`,
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          setIsSubmitting(true);
          try {
            // 3. Verify payment in our backend
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wc_order_id: wcOrderId,
              }),
            });

            if (verifyRes.ok) {
              router.push(`/thank-you?order_id=${wcOrderId}`);
            } else {
              const err = await verifyRes.json();
              setError(err.message || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('An error occurred while verifying your payment.');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: `${billing.first_name} ${billing.last_name}`,
          email: billing.email,
          contact: billing.phone,
        },
        theme: {
          color: '#1a1a1a',
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
          }
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI / Google Pay / PhonePe',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              }
            },
            sequence: ['block.upi', 'block.card', 'block.netbanking'],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setError(err.message || 'Could not initialize Razorpay modal.');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartToken || !cart) return;
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. If not logged in, register first using account_email
      if (!user && billing.account_email && billing.password) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: billing.first_name,
            lastName: billing.last_name,
            email: billing.account_email,
            password: billing.password,
          }),
        });
        
        if (!regRes.ok) {
          const regData = await regRes.json();
          if (regData.code !== 'registration-error-email-exists') {
            throw new Error(regData.message || 'Registration failed.');
          }
        }

        // Silent login
        await nextAuthSignIn('credentials', {
          email: billing.account_email,
          password: billing.password,
          redirect: false,
        });

        // Sync store
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const session = await sessionRes.json();
          if (session.user) {
            useAuthStore.getState().setUser({
              id: session.wpId,
              email: session.user.email,
              firstName: session.wpFirstName,
              lastName: session.wpLastName,
              displayName: session.user.name,
              token: session.wpToken,
            });
          }
        }
      }

      // 2. Place the order
      const result = await placeOrder(
        cartToken,
        billing,
        selectedItemIds,
        cart.items,
        paymentMethod,
        user?.token
      );

      // Refresh the cart from the server to reflect only the remaining (unselected) items
      const updatedCart = await getCart(cartToken);
      setCart(updatedCart);
      clearSelection();

      if (!user) {
        localStorage.setItem('fr_guest_order_email', billing.email);
      }

      if (paymentMethod === 'razorpay') {
        // Trigger the modal flow
        await handleRazorpayPayment(result.orderId, subtotal);
      } else {
        router.push(`/thank-you?order_id=${result.orderId}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong placing your order. Please try again.');
      setIsSubmitting(false);
    }
  };


  const isFormValid = billing.first_name && billing.last_name &&
    billing.address_1 && billing.city && billing.state &&
    billing.postcode && billing.email && billing.phone;

  if (!cart || selectedItems.length === 0) {
    return (
      <div className={styles.checkoutContainer}>
        <p>No items selected for checkout. <button className={styles.backLink} onClick={() => router.push('/cart')}>← Return to Cart</button></p>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <button className={styles.backLink} onClick={() => router.back()}>
        ← Back to Cart
      </button>
      <h1 className={styles.pageTitle}>Checkout</h1>

      {/* ── NEW: ACCOUNT SECTION ── */}
      <div className={styles.accountSection} style={{ marginBottom: '40px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2 className={styles.sectionTitle} style={{ marginTop: 0 }}>Account Information</h2>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8FA899' }}></div>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              Logged in as: <strong>{user.email}</strong>
            </p>
          </div>
        ) : (
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Account Email<span className={styles.required}>*</span></label>
              <input
                className={styles.formInput} type="email"
                name="account_email" value={billing.account_email || ''}
                onChange={handleChange} required
                placeholder="email@example.com"
              />
              <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>This will be your primary login and order tracking email.</small>
            </div>
            <div className={styles.formGroup}>
              <label>Password<span className={styles.required}>*</span></label>
              <input
                className={styles.formInput} type="password"
                name="password" value={billing.password || ''}
                onChange={handleChange} required
                placeholder="Choose a password (min. 8 characters)"
                minLength={8}
              />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.checkoutGrid}>

          {/* ── LEFT: BILLING FORM ── */}
          <div>
            <h2 className={styles.sectionTitle}>Billing Details</h2>
            <div className={styles.formGrid}>

              <div className={styles.formGroup}>
                <label>First Name<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="first_name" value={billing.first_name}
                  onChange={handleChange} required
                  placeholder="First name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Last Name<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="last_name" value={billing.last_name}
                  onChange={handleChange} required
                  placeholder="Last name"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>Company Name <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="company" value={billing.company}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>Street Address<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="address_1" value={billing.address_1}
                  onChange={handleChange} required
                  placeholder="House number and street name"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <input
                  className={styles.formInput} type="text"
                  name="address_2" value={billing.address_2}
                  onChange={handleChange}
                  placeholder="Apartment, suite, unit, etc. (optional)"
                />
              </div>

              <div className={styles.formGroup}>
                <label>City<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="city" value={billing.city}
                  onChange={handleChange} required
                  placeholder="Town / City"
                />
              </div>

              <div className={styles.formGroup}>
                <label>State<span className={styles.required}>*</span></label>
                <select
                  className={styles.formSelect}
                  name="state" value={billing.state}
                  onChange={handleChange} required
                >
                  {INDIA_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>PIN Code<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="text"
                  name="postcode" value={billing.postcode}
                  onChange={handleChange} required
                  placeholder="PIN code"
                  pattern="[0-9]{6}"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="tel"
                  name="phone" value={billing.phone}
                  onChange={handleChange} required
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>Billing Email Address<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="email"
                  name="email" value={billing.email}
                  onChange={handleChange} required
                  placeholder="Billing contact email"
                />
                <small style={{ color: '#888', marginTop: '5px', display: 'block' }}>Email for invoices and payment updates (can be different from account).</small>
              </div>
            </div>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Your Order</h2>

            <div className={styles.orderItems}>
              {selectedItems.map(item => {
                const lineTotal = parseFloat(item.price.amount) * item.quantity;
                return (
                  <div key={item.id} className={styles.orderItem}>
                    {item.image && (
                      <img src={item.image} alt={item.title} className={styles.itemImage} />
                    )}
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.title}</div>
                      {item.customData && Object.entries(item.customData).map(([k, v]) => (
                        <div key={k} className={styles.itemMeta}>{k}: {v}</div>
                      ))}
                    </div>
                    <div className={styles.itemQtyPrice}>
                      {item.quantity} × ₹{parseFloat(item.price.amount).toLocaleString('en-IN')}
                      <br />
                      <span style={{ fontSize: '0.95rem' }}>
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.totalsSection}>
              <div className={styles.totalsRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.totalsRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={`${styles.totalsRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className={styles.paymentSection}>
              <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Payment Method</h3>

              <label className={`${styles.paymentOption} ${paymentMethod === 'razorpay' ? styles.paymentOptionSelected : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className={styles.paymentRadio}
                />
                <div className={styles.paymentOptionContent}>
                  <span className={styles.paymentOptionLabel}>🔒 Pay Now (UPI, Cards, Net Banking)</span>
                  <span className={styles.paymentOptionDesc}>Pay securely via UPI, Cards, Net Banking &amp; Wallets</span>
                </div>
              </label>

              <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentOptionSelected : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className={styles.paymentRadio}
                />
                <div className={styles.paymentOptionContent}>
                  <span className={styles.paymentOptionLabel}>💵 Cash on Delivery</span>
                  <span className={styles.paymentOptionDesc}>Pay with cash when your order arrives</span>
                </div>
              </label>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              type="submit"
              className={styles.placeOrderBtn}
              disabled={!isFormValid || isSubmitting || isLoading}
            >
              {isSubmitting ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};
