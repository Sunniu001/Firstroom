import React from 'react';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.column}>
            <h4 className={styles.title}>FirstRoom</h4>
            <p className={styles.text}>Elevating everyday living with premium essentials curated for the modern aesthete.</p>
          </div>
          <div className={styles.column}>
            <h4 className={styles.title}>Shop</h4>
            <ul className={styles.list}>
              <li><a href="#" className={styles.link}>New Arrivals</a></li>
              <li><a href="#" className={styles.link}>Best Sellers</a></li>
              <li><a href="#" className={styles.link}>Collections</a></li>
              <li><a href="#" className={styles.link}>Accessories</a></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4 className={styles.title}>Support</h4>
            <ul className={styles.list}>
              <li><a href="#" className={styles.link}>FAQ</a></li>
              <li><a href="#" className={styles.link}>Shipping & Returns</a></li>
              <li><a href="#" className={styles.link}>Contact Us</a></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4 className={styles.title}>Newsletter</h4>
            <p className={styles.text}>Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className={styles.newsletter}>
              <input type="email" placeholder="Enter your email address" className={styles.input} />
              <button className={styles.button}>Subscribe</button>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} FirstRoom. All rights reserved.</p>
          <div className={styles.legal}>
            <a href="#" className={styles.link}>Privacy Policy</a>
            <a href="#" className={styles.link}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
