'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore, WishlistItem } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { addToCart } from '@/lib/api/cart';
import styles from './WishlistPage.module.css';

export const WishlistPage: React.FC = () => {
  const router = useRouter();
  const { lists, deleteList } = useWishlistStore();
  const { cartToken, setCart, setCartToken, setIsOpen } = useCartStore();
  const [activeListId, setActiveListId] = useState(lists[0]?.id || '');
  const [addingId, setAddingId] = useState<string | null>(null);

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingId(item.productId);
    try {
      const { cart: updatedCart, cartToken: newToken } = await addToCart(
        cartToken,
        item.productId,
        1
      );
      setCart(updatedCart);
      if (newToken) setCartToken(newToken);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  const handleDeleteList = () => {
    if (!activeList) return;
    deleteList(activeList.id);
    const remaining = lists.filter(l => l.id !== activeList.id);
    setActiveListId(remaining[0]?.id || '');
  };

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const { removeItemFromList } = useWishlistStore();

  const toggleRow = (productId: string) => {
    setSelectedRows(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleBulkAddToCart = async () => {
    for (const productId of selectedRows) {
      const item = activeList?.items.find(i => i.productId === productId);
      if (item) await handleAddToCart(item);
    }
    setSelectedRows([]);
  };

  const handleBulkRemove = () => {
    selectedRows.forEach(productId => {
      if (activeList) removeItemFromList(activeList.id, productId);
    });
    setSelectedRows([]);
  };

  if (lists.length === 0 || !activeList) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Wishlist</h1>
        <p className={styles.empty}>Your wishlist is empty.</p>
        <Link href="/" className={styles.returnLink}>← Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Wishlist</h1>

      {/* List Tabs */}
      <div className={styles.tabs}>
        {lists.map(list => (
          <button
            key={list.id}
            className={`${styles.tab} ${activeListId === list.id ? styles.tabActive : ''}`}
            onClick={() => { setActiveListId(list.id); setSelectedRows([]); }}
          >
            {list.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Delete Wishlist */}
      <div className={styles.tableHeader}>
        <button className={styles.deleteBtn} onClick={handleDeleteList}>
          DELETE WISHLIST
        </button>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thCheck}></th>
            <th className={styles.thProduct}>PRODUCTS</th>
            <th className={styles.thPrice}>PRICE</th>
            <th className={styles.thStock}>STOCK STATUS</th>
            <th className={styles.thAction}>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {activeList.items.length === 0 ? (
            <tr>
              <td colSpan={5} className={styles.emptyRow}>No items in this list.</td>
            </tr>
          ) : (
            activeList.items.map(item => {
              const isSelected = selectedRows.includes(item.productId);
              const isAdding = addingId === item.productId;
              return (
                <tr key={item.productId} className={styles.row}>
                  <td className={styles.tdCheck}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isSelected}
                      onChange={() => toggleRow(item.productId)}
                    />
                  </td>
                  <td className={styles.tdProduct}>
                    <Link href={`/products/${item.handle}`} className={styles.productLink}>
                      {item.image && (
                        <img src={item.image} alt={item.title} className={styles.productImage} />
                      )}
                      <span className={styles.productName}>{item.title}</span>
                    </Link>
                  </td>
                  <td className={styles.tdPrice}>
                    ₹{parseFloat(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={styles.tdStock}>
                    <span className={item.availableForSale ? styles.inStock : styles.outOfStock}>
                      {item.availableForSale ? 'IN STOCK' : 'OUT OF STOCK'}
                    </span>
                  </td>
                  <td className={styles.tdAction}>
                    <button
                      className={styles.addToCartBtn}
                      onClick={() => handleAddToCart(item)}
                      disabled={isAdding || !item.availableForSale}
                    >
                      {isAdding ? 'ADDING...' : 'ADD TO CART'}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Social Share */}
      <div className={styles.shareRow}>
        <button className={styles.shareBtn} title="Share on Facebook">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
        </button>
        <button className={styles.shareBtn} title="Share on Instagram">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </button>
        <button className={styles.shareBtn} title="Copy link">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
        </button>
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <Link href="/" className={styles.returnLink}>‹ RETURN TO SHOP</Link>
        <div className={styles.footerBtns}>
          <button
            className={styles.footerBtn}
            onClick={handleBulkAddToCart}
            disabled={selectedRows.length === 0}
          >
            ADD TO CART
          </button>
          <button
            className={styles.footerBtn}
            onClick={handleBulkRemove}
            disabled={selectedRows.length === 0}
          >
            REMOVE FROM WISHLIST
          </button>
        </div>
      </div>
    </div>
  );
};
