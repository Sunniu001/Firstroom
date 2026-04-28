import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Logo & Social Column */}
          <div className={styles.column}>
            <div className={styles.logoContainer}>
              <Link href="/">
                <Image 
                  src="/images/Untitled-design-scaled.png" 
                  alt="First Room Collective" 
                  width={150} 
                  height={80} 
                  className={styles.logo}
                  style={{ objectFit: 'contain' }}
                />
              </Link>
            </div>
            <div className={styles.socialSection}>
              <h5 className={styles.socialHeading}>STAY IN TOUCH WITH US</h5>
              <div className={styles.socialIcons}>
                <Link href="https://www.instagram.com/firstroom.in" target="_blank" className={styles.socialIcon} aria-label="Instagram">
                  <Image src="/images/SVG/instagram.png" alt="Instagram" width={18} height={18} />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61556752988954" target="_blank" className={styles.socialIcon} aria-label="Facebook">
                  <Image src="/images/SVG/facebook.png" alt="Facebook" width={18} height={18} />
                </Link>
                <Link href="https://www.linkedin.com/company/firstroom/" target="_blank" className={styles.socialIcon} aria-label="LinkedIn">
                  <Image src="/images/SVG/linkedin.png" alt="LinkedIn" width={18} height={18} />
                </Link>
                <Link href="https://www.pinterest.com/firstroom0001/" target="_blank" className={styles.socialIcon} aria-label="Pinterest">
                  <Image src="/images/SVG/pinterest.png" alt="Pinterest" width={18} height={18} />
                </Link>
                <Link href="https://wa.me/+919650706644" target="_blank" className={styles.socialIcon} aria-label="WhatsApp">
                  <Image src="/images/SVG/whatsapp.png" alt="WhatsApp" width={18} height={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className={styles.column}>
            <h4 className={styles.heading}>QUICK LINKS</h4>
            <ul className={styles.list}>
              <li><Link href="/category/wallpaper" className={styles.link}>WALLPAPER</Link></li>
              <li><Link href="/category/home-decor" className={styles.link}>HOME DECOR</Link></li>
              <li><Link href="/custom-design" className={styles.link}>CUSTOM DESIGN</Link></li>
              <li><Link href="/our-story" className={styles.link}>OUR STORY</Link></li>
              <li><Link href="/contact" className={styles.link}>CONTACT</Link></li>
            </ul>
          </div>

          {/* Information Column */}
          <div className={styles.column}>
            <h4 className={styles.heading}>INFORMATION</h4>
            <ul className={styles.list}>
              <li><Link href="/terms" className={styles.link}>TERMS & CONDITIONS</Link></li>
              <li><Link href="/privacy" className={styles.link}>PRIVACY POLICY</Link></li>
              <li><Link href="/shipping" className={styles.link}>SHIPPING POLICY</Link></li>
              <li><Link href="/refund" className={styles.link}>REFUND POLICY</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className={styles.column}>
            <h4 className={styles.heading}>CONTACT US</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <div className={styles.contactIconCircle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <span>+91 96507 06644</span>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIconCircle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <span>SUPPORT@FIRSTROOM.IN</span>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactIconCircle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span>A10, GREENWOOD CITY, SECTOR 45, GURUGRAM, HARYANA 122003</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copyright}>All rights reserved | © 2026 First Room Collective</p>
      </div>
    </footer>
  );
};
