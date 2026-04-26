'use client';
import Link from "next/link";
import React, { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { updateCartItem, removeCartItem, getCart } from '@/lib/api/cart';
import { Button } from '@/components/Button/Button';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { cart, cartToken, isOpen, setIsOpen, setCart, setIsLoading, isLoading } = useCartStore();

  useEffect(() => {
    // Rehydrate cart on mount if we have a token but no cart data
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
    if (!cartToken) return;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      return handleRemoveItem(itemKey);
    }

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

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart {cart ? `(${cart.totalQuantity})` : ''}</h2>
          <button className={styles.closeButton} onClick={() => setIsOpen(false)}>&times;</button>
        </div>

        <div className={styles.content}>
          {isLoading && <div style={{ textAlign: 'center', marginBottom: '1rem' }}>Updating...</div>}

          {isEmpty ? (
            <div className={styles.emptyState}>
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  {item.image && (
                    <img src={item.image} alt={item.title} className={styles.itemImage} />
                  )}
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isLoading}
                        aria-label="Remove item"
                      >
                        &times;
                      </button>
                    </div>

                    {item.customData && Object.keys(item.customData).length > 0 && (
                      <div className={styles.customData}>
                        {Object.entries(item.customData).map(([key, value]) => (
                          <div key={key} className={styles.customDataRow}>
                            <span className={styles.customDataKey}>{key}:</span>
                            <span className={styles.customDataValue}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.itemPriceRow}>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <span className={styles.multiplier}>&times;</span>
                      <span className={styles.price}>
                        ₹{parseFloat(item.price.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isEmpty && cart && (
          <div className={styles.footer}>
            <div className={styles.summary}>
              <span>Subtotal:</span>
              <span>₹{parseFloat(cart.cost.subtotalAmount.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.footerLinks}>
              <Link
                href="/cart"
                className={styles.footerLink}
                onClick={() => setIsOpen(false)}
              >
                View cart
              </Link>
              <Link href="/checkout" className={styles.footerLink} onClick={() => setIsOpen(false)}>
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
