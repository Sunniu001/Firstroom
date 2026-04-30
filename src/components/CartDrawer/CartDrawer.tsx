'use client';
import Link from "next/link";
import React, { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { updateCartItem, removeCartItem, getCart } from '@/lib/api/cart';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { cart, cartToken, isOpen, setIsOpen, setCart, setIsLoading, isLoading } = useCartStore();

  useEffect(() => {
    if (cartToken && !cart) {
      const fetchCart = async () => {
        setIsLoading(true);
        try {
          const fetchedCart = await getCart(cartToken);
          setCart(fetchedCart);
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCart();
    }
  }, [cartToken, cart, setCart, setIsLoading]);

  const handleUpdateQuantity = async (itemKey: string, currentQuantity: number, change: number) => {
    if (!cartToken || !cart) return;
    const item = cart.items.find(i => i.id === itemKey);
    const area = item?.customData?.Area ? parseFloat(item.customData.Area) : 1;
    const newQuantity = currentQuantity + (change * area);
    if (newQuantity < (area * 0.9)) return handleRemoveItem(itemKey);

    setIsLoading(true);
    try {
      const updatedCart = await updateCartItem(cartToken, itemKey, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemKey: string) => {
    if (!cartToken) return;
    setIsLoading(true);
    try {
      const updatedCart = await removeCartItem(cartToken, itemKey);
      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = !cart || cart.items.length === 0;
  const subtotal = cart ? parseFloat(cart.cost.subtotalAmount.amount) : 0;
  const freeShippingThreshold = 3000;
  const awayFromFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)} />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart {cart ? `(${cart.totalQuantity})` : ''}</h2>
          <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className={styles.content}>
          {!isEmpty && (
            <div className={styles.shippingBarWrapper}>
              <div className={styles.shippingText}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                {awayFromFree > 0 ? (
                  <span>You're <strong>₹{awayFromFree.toLocaleString('en-IN')}</strong> away from free shipping!</span>
                ) : (
                  <span>Congratulations! You've unlocked <strong>Free Shipping</strong></span>
                )}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}

          {isEmpty ? (
            <div className={styles.emptyState}>
              <p>Your cart is empty.</p>
              <button className={styles.primaryButton} onClick={() => setIsOpen(false)}>Continue Shopping</button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemImageWrapper}>
                    {item.image && <img src={item.image} alt={item.title} className={styles.itemImage} />}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.title}</h3>
                      <button className={styles.removeItem} onClick={() => handleRemoveItem(item.id)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                      </button>
                    </div>
                    
                    {item.customData && Object.keys(item.customData).length > 0 && (
                      <div className={styles.itemMeta}>
                        {Object.entries(item.customData).map(([key, value]) => (
                          <div key={key} className={styles.metaRow}>
                            <span className={styles.metaLabel}>{key}:</span>
                            <span className={styles.metaValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.itemPrice}>
                      ₹{(parseFloat(item.price.amount) * (item.customData?.Area ? parseFloat(item.customData.Area) : 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    
                    <div className={styles.itemFooter}>
                      <div className={styles.quantitySelector}>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)} disabled={isLoading}>—</button>
                        <span>
                          {item.customData?.Area ? Math.round(item.quantity / parseFloat(item.customData.Area)) : item.quantity}
                        </span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)} disabled={isLoading}>+</button>
                      </div>
                      <div className={styles.itemTotal}>
                        ₹{(parseFloat(item.price.amount) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEmpty && cart && (
          <div className={styles.footer}>
            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.shippingNote}>Calculated at checkout</span>
              </div>
              <div className={styles.totalRow}>
                <div className={styles.totalLabel}>
                  <strong>Total</strong>
                  <span className={styles.taxNote}>Inclusive of all taxes</span>
                </div>
                <div className={styles.totalAmount}>
                  <strong>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/checkout" className={styles.checkoutBtn} onClick={() => setIsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '6px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Checkout
              </Link>
              <Link href="/cart" className={styles.viewCartBtn} onClick={() => setIsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '6px' }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                View cart
              </Link>
            </div>


            <div className={styles.trustBadges}>
              <div className={styles.badgeItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure checkout
              </div>
              <span className={styles.dot}>•</span>
              <div className={styles.badgeItem}>Easy returns</div>
              <span className={styles.dot}>•</span>
              <div className={styles.badgeItem}>24/7 support</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
