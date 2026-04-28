'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SocialShare.module.css';

export const SocialShare = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
    setTitle(document.title);
  }, []);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    // X and Telegram might need fallback or specific icons if not in folder
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  return (
    <div className={styles.container}>
      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className={styles.icon} aria-label="Facebook">
        <Image src="/images/SVG/facebook.png" alt="Facebook" width={20} height={20} />
      </a>
      <a href={shareLinks.x} target="_blank" rel="noopener noreferrer" className={styles.icon} aria-label="X">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="4" y1="4" x2="20" y2="20"></line><line x1="20" y1="4" x2="4" y2="20"></line></svg>
      </a>
      <a href={shareLinks.pinterest} target="_blank" rel="noopener noreferrer" className={styles.icon} aria-label="Pinterest">
        <Image src="/images/SVG/pinterest.png" alt="Pinterest" width={20} height={20} />
      </a>
      <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className={styles.icon} aria-label="Telegram">
         <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </a>
      <a href={shareLinks.email} className={styles.icon} aria-label="Email">
         <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </a>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.icon} aria-label="WhatsApp">
        <Image src="/images/SVG/whatsapp.png" alt="WhatsApp" width={20} height={20} />
      </a>
    </div>
  );
};

