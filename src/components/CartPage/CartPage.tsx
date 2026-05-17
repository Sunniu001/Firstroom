'use client';

import React, { useEffect, useMemo, useState } from 'react';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];
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
    cartLastSyncedAt,
    setCart, 
    setCartToken,
    isLoading, 
    setIsLoading,
    selectedItemIds,
    toggleItemSelection,
    selectAllItems,
  } = useCartStore();

  const [address, setAddress] = useState({
    address_1: 'NEAR SHIV MANDIR Pundag Ranchi',
    city: 'RANCHI',
    postcode: '834004',
    state: 'Delhi'
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState({
    address_1: '',
    city: '',
    postcode: '',
    state: ''
  });

  useEffect(() => {
    try {
      const cached = localStorage.getItem('cart-shipping-address');
      if (cached) {
        setAddress(JSON.parse(cached));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOpenEditor = () => {
    setTempAddress(address);
    setIsEditingAddress(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAddress.address_1 || !tempAddress.city || !tempAddress.postcode || !tempAddress.state) {
      return;
    }
    setAddress(tempAddress);
    localStorage.setItem('cart-shipping-address', JSON.stringify(tempAddress));
    setIsEditingAddress(false);
  };

  useEffect(() => {
    const shouldRevalidate =
      cartToken &&
      (!cart || !cartLastSyncedAt || (Date.now() - cartLastSyncedAt > 30_000));

    if (shouldRevalidate) {
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
  }, [cartToken, cart, cartLastSyncedAt, setCart, setIsLoading]);

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
      const { cart: updatedCart, cartToken: newCartToken } = await updateCartItem(cartToken, itemKey, newQuantity);
      setCart(updatedCart);
      setCartToken(newCartToken);
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
                  
                  <div className={`${styles.quantityCol} ${item.isWallpaper ? styles.hiddenCol : ''}`}>
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
                Shipping to <strong>{address.address_1}, {address.city} {address.postcode}, {address.state}.</strong>
              </span>
              <div className={styles.changeAddress} onClick={handleOpenEditor}>
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

      {isEditingAddress && (
        <div className={styles.modalOverlay} onClick={() => setIsEditingAddress(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Shipping Address</h3>
              <button className={styles.modalCloseBtn} onClick={() => setIsEditingAddress(false)}>
                &times;
              </button>
            </div>
            
            <form className={styles.modalForm} onSubmit={handleSaveAddress}>
              <div className={styles.modalField}>
                <label>Street Address</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  value={tempAddress.address_1}
                  onChange={(e) => setTempAddress({ ...tempAddress, address_1: e.target.value })}
                  placeholder="e.g. Near Shiv Mandir, Pundag"
                  required
                />
              </div>
              
              <div className={styles.modalField}>
                <label>City</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  value={tempAddress.city}
                  onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                  placeholder="e.g. Ranchi"
                  required
                />
              </div>
              
              <div className={styles.modalField}>
                <label>State</label>
                <select 
                  className={styles.modalSelect}
                  value={tempAddress.state}
                  onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                  required
                >
                  <option value="">Select State</option>
                  {INDIA_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.modalField}>
                <label>PIN Code</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  value={tempAddress.postcode}
                  onChange={(e) => setTempAddress({ ...tempAddress, postcode: e.target.value })}
                  placeholder="e.g. 834004"
                  required
                />
              </div>
              
              <div className={styles.modalActions}>
                <button type="submit" className={styles.modalSubmitBtn}>
                  Update Address
                </button>
                <button type="button" className={styles.modalCancelBtn} onClick={() => setIsEditingAddress(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
