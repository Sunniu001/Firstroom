'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { getCart, placeOrder, BillingDetails } from '@/lib/api/cart';
import styles from './CheckoutPage.module.css';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartToken || !cart) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await placeOrder(
        cartToken,
        billing,
        selectedItemIds,
        cart.items,
        paymentMethod
      );

      // Clear the cart state and selection after placing order
      setCart(null);
      clearSelection();

      // For Razorpay: follow the payment gateway redirect URL.
      // For COD (and any other non-gateway method): go directly to our thank-you page.
      if (paymentMethod === 'razorpay' && result.paymentRedirectUrl) {
        window.location.href = result.paymentRedirectUrl;
      } else {
        router.push(`/thank-you?order_id=${result.orderId}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong placing your order. Please try again.');
    } finally {
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
                <label>Email Address<span className={styles.required}>*</span></label>
                <input
                  className={styles.formInput} type="email"
                  name="email" value={billing.email}
                  onChange={handleChange} required
                  placeholder="your@email.com"
                />
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
                  <span className={styles.paymentOptionLabel}>🔒 Razorpay</span>
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
