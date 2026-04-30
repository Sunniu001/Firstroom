'use client';

import React, { useEffect, useMemo } from 'react';
import { useCartStore } from '@/store/cartStore';
import { updateCartItem, getCart } from '@/lib/api/cart';
import { useRouter } from 'next/navigation';
import styles from './CartPage.module.css';
import { Button } from '@/components/Button/Button';
import Link from 'next/link';

export const CartPage: React.FC = () => {
  const router = useRouter();
  const { 
    cart, 
    cartToken, 
    setCart, 
    isLoading, 
    setIsLoading,
    selectedItemIds,
    toggleItemSelection,
    selectAllItems,
  } = useCartStore();

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

  // Initially select all items if none are selected, or keep selection in sync
  useEffect(() => {
    if (cart && cart.items.length > 0 && selectedItemIds.length === 0) {
      selectAllItems(cart.items.map(item => item.id));
    }
  }, [cart, selectedItemIds.length, selectAllItems]);

  const handleUpdateQuantity = async (itemKey: string, currentQuantity: number, change: number) => {
    if (!cartToken || !cart) return;
    const item = cart.items.find(i => i.id === itemKey);
    const area = item?.customData?.Area ? parseFloat(item.customData.Area) : 1;
    const newQuantity = currentQuantity + (change * area);
    
    if (newQuantity < (area * 0.9)) {
      // Potentially remove item or just stop
      return;
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

  const selectedSubtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.items
      .filter(item => selectedItemIds.includes(item.id))
      .reduce((total, item) => total + (parseFloat(item.price.amount) * item.quantity), 0);
  }, [cart, selectedItemIds]);

  const isEmpty = !cart || cart.items.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.emptyState}>
          <h2>Your cart is empty</h2>
          <p style={{ marginTop: '1rem', marginBottom: '2rem' }}>You have no items in your shopping cart.</p>
          <Link href="/">
            <Button variant="primary">Return to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Shopping Cart</h1>
      
      <div className={styles.cartGrid}>
        <div className={styles.cartTableWrapper}>
          <div className={styles.tableHeader}>
            <div>{/* Checkbox col */}</div>
            <div>PRODUCT</div>
            <div>PRICE</div>
            <div>QUANTITY</div>
            <div>SUBTOTAL</div>
          </div>
          
          <div className={styles.tableBody}>
            {cart.items.map(item => {
              const isChecked = selectedItemIds.includes(item.id);
              const price = parseFloat(item.price.amount);
              const subtotal = price * item.quantity;

              return (
                <div key={item.id} className={styles.cartItemRow}>
                  <div className={styles.checkboxCol}>
                    <input 
                      type="checkbox" 
                      className={styles.customCheckbox}
                      checked={isChecked}
                      onChange={() => toggleItemSelection(item.id)}
                    />
                  </div>
                  
                  <div className={styles.productCol}>
                    {item.image && (
                      <img src={item.image} alt={item.title} className={styles.productImage} />
                    )}
                    <div className={styles.productDetails}>
                      <div className={styles.productName}>{item.title}</div>
                      
                      {item.customData && Object.keys(item.customData).length > 0 && (
                        <div className={styles.customData}>
                          {Object.entries(item.customData).map(([key, value]) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.priceCol}>
                    ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    {item.isWallpaper && <span className={styles.priceUnit}> /sqft</span>}
                  </div>
                  
                  <div className={styles.quantityCol}>
                    {!item.isWallpaper && (
                      <div className={styles.qtyControl}>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          disabled={isLoading || item.quantity <= 1}
                        >
                          -
                        </button>
                        <div className={styles.qtyValue}>{item.quantity}</div>
                        <button 
                          className={styles.qtyBtn}
                          onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          disabled={isLoading}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.subtotalCol}>
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.totalsSidebar}>
          <h2 className={styles.totalsTitle}>Cart Totals</h2>
          
          <div className={styles.totalsRow}>
            <span>Sub-total</span>
            <span>₹{selectedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className={styles.totalsRow} style={{ alignItems: 'flex-start' }}>
            <span>Shipment</span>
            <div className={styles.shipmentValue}>
              <strong>Free shipping</strong>
              <span className={styles.shippingAddress}>
                Shipping to <strong>NEAR SHIV MANDIR Pundag Ranchi, RANCHI 834004, Jharkhand.</strong>
              </span>
              <div className={styles.changeAddress}>
                Change address 🚚
              </div>
            </div>
          </div>
          
          <div className={`${styles.totalsRow} ${styles.totalRow}`}>
            <strong>Total</strong>
            <strong>₹{selectedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
          </div>
          
          <div className={styles.couponSection}>
            <span className={styles.couponLabel}>Apply Coupon:</span>
            <div className={styles.couponInputGroup}>
              <input type="text" placeholder="COUPON CODE" className={styles.couponInput} />
              <button className={styles.couponBtn}>APPLY COUPON</button>
            </div>
          </div>
          
          <Link
            href="/checkout"
            onClick={(e) => { if (selectedItemIds.length === 0 || isLoading) e.preventDefault(); }}
            className={styles.checkoutBtn}
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none', opacity: selectedItemIds.length === 0 || isLoading ? 0.45 : 1, pointerEvents: selectedItemIds.length === 0 || isLoading ? 'none' : 'auto' }}
          >
            PROCEED TO CHECKOUT
          </Link>
        </div>
      </div>
    </div>
  );
};
