import React from 'react';
import styles from './SocialShare.module.css';

export const SocialShare = () => {
  return (
    <div className={styles.container}>
      <a href="#" className={styles.icon} aria-label="Facebook">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      </a>
      <a href="#" className={styles.icon} aria-label="X">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg>
      </a>
      <a href="#" className={styles.icon} aria-label="Pinterest">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M12 2C6.5 2 2 6.5 2 12c0 4.3 2.6 8 6.4 9.5-.1-.8-.2-2 0-2.8l1.3-5.5s-.3-.6-.3-1.6c0-1.5.9-2.6 2-2.6 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-1 3.9-.3 1.1.6 2 1.6 2 1.9 0 3.4-2 3.4-4.9 0-2.6-1.9-4.4-4.6-4.4-3.1 0-5.3 2.3-5.3 5.1 0 1 .4 2.1.9 2.7.1.1.1.2.1.3-.1.4-.3 1.2-.3 1.4-.1.3-.3.4-.6.3-2.3-1.1-3.7-4.5-3.7-7.2 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6.1 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.5-1.2l-.7 2.6c-.2.9-.9 2-1.3 2.7 1.1.3 2.2.5 3.4.5 5.5 0 10-4.5 10-10S17.5 2 12 2z"></path></svg>
      </a>
      <a href="#" className={styles.icon} aria-label="Telegram">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </a>
      <a href="#" className={styles.icon} aria-label="Email">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </a>
      <a href="#" className={styles.icon} aria-label="WhatsApp">
         <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </a>
    </div>
  );
};
