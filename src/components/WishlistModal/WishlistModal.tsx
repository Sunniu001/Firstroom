'use client';

import React, { useState } from 'react';
import { useWishlistStore, WishlistItem } from '@/store/wishlistStore';
import styles from './WishlistModal.module.css';

interface WishlistModalProps {
  item: WishlistItem;
  onClose: () => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({ item, onClose }) => {
  const { lists, createList, addItemToList, removeItemFromList, getListsContaining } = useWishlistStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const selectedListIds = getListsContaining(item.productId);

  const handleToggle = (listId: string) => {
    if (selectedListIds.includes(listId)) {
      removeItemFromList(listId, item.productId);
    } else {
      addItemToList(listId, item);
    }
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newId = createList(newListName.trim());
    addItemToList(newId, item);
    setNewListName('');
    setIsCreating(false);
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Select Wishlist">
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <h2 className={styles.title}>Select Wishlist</h2>

        <div className={styles.listItems}>
          {lists.map(list => {
            const isChecked = selectedListIds.includes(list.id);
            return (
              <label key={list.id} className={styles.listRow}>
                <span className={styles.listName}>{list.name}</span>
                <input
                  type="checkbox"
                  className={styles.toggle}
                  checked={isChecked}
                  onChange={() => handleToggle(list.id)}
                />
              </label>
            );
          })}
        </div>

        {isCreating && (
          <div className={styles.createInput}>
            <input
              type="text"
              placeholder="Wishlist name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              autoFocus
              className={styles.nameInput}
            />
            <button className={styles.saveBtn} onClick={handleCreateList}>Save</button>
          </div>
        )}

        <div className={styles.footer}>
          <button
            className={styles.createBtn}
            onClick={() => setIsCreating(v => !v)}
          >
            CREATE WISHLIST
          </button>
          <button className={styles.doneBtn} onClick={onClose}>
            DONE
          </button>
        </div>
      </div>
    </>
  );
};
