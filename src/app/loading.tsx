import React from 'react';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loaderWrapper}>
        <div className={styles.logoText}>FIRST ROOM</div>
        <div className={styles.progressBar}>
          <div className={styles.progressLine}></div>
        </div>
      </div>
    </div>
  );
}
