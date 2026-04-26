import React from 'react';
import styles from './ProductFeatures.module.css';

export const ProductFeatures = () => {
  return (
    <div className={styles.container}>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
           <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <span>Made In India</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
           <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.2" fill="none"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <span>Shipping</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
           <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.2" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <span>Tailor Made</span>
      </div>
      <div className={styles.feature}>
        <div className={styles.iconWrapper}>
           <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.2" fill="none"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
        </div>
        <span>Low Emission Printing</span>
      </div>
    </div>
  );
};
