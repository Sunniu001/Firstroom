'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  
  const { cart, setIsOpen } = useCartStore();
  const { lists } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    router.push('/');
  };

  const cartCount = cart?.totalQuantity || 0;
  const wishlistCount = lists.reduce((sum, l) => sum + l.items.length, 0);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
                <circle cx="12" cy="15" r="2" />
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>FIRST ROOM</span>
              <span className={styles.logoSub}>COLLECTIVE</span>
            </div>
          </Link>
        </div>
        
        <div className={styles.center}>
          <nav className={styles.nav}>
            <div className={styles.navItem}>
              <Link href="/category/wallpapers" className={styles.navLink}>WALLPAPER</Link>
              <div className={styles.dropdown}>
                <Link href="/category/artistic-wallpaper" className={styles.dropdownItem}>Artistic</Link>
                <Link href="/category/botanical-rhythm" className={styles.dropdownItem}>Botanical Rhythm</Link>
                <Link href="/category/inner-landscape" className={styles.dropdownItem}>Inner Landscape</Link>
                <Link href="/category/motif-impression" className={styles.dropdownItem}>Motif Impression</Link>
                <Link href="/category/timeless" className={styles.dropdownItem}>Timeless</Link>
                <Link href="/category/tropical-wallpaper" className={styles.dropdownItem}>Tropical</Link>
                <Link href="/category/kids" className={styles.dropdownItem}>Kids</Link>
                <Link href="/category/wallpapers" className={styles.dropdownItem}>View All</Link>
              </div>
            </div>

            <div className={styles.navItem}>
              <Link href="/category/home-decor" className={styles.navLink}>HOME DECOR</Link>
              <div className={styles.dropdown}>
                <Link href="/category/decals" className={styles.dropdownItem}>Decals</Link>
                <Link href="/category/desk-quote" className={styles.dropdownItem}>Desk Quote</Link>
                <Link href="/category/frame" className={styles.dropdownItem}>Frame</Link>
                <Link href="/category/nameplate" className={styles.dropdownItem}>Nameplate</Link>
                <Link href="/category/home-decor" className={styles.dropdownItem}>View All</Link>
              </div>
            </div>

            <div className={styles.navItem}>
              <Link href="/custom-design" className={styles.navLink}>CUSTOM DESIGN</Link>
            </div>
            <div className={styles.navItem}>
              <Link href="/our-story" className={styles.navLink}>OUR STORY</Link>
            </div>
            <div className={styles.navItem}>
              <Link href="/contact" className={styles.navLink}>CONTACT US</Link>
            </div>
          </nav>
        </div>

        <div className={styles.right}>
          <button className={styles.iconButton} aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          
          <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist" style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {mounted && wishlistCount > 0 && (
              <span className={styles.badge}>{wishlistCount}</span>
            )}
          </Link>

          <button className={styles.iconButton} aria-label="Cart" onClick={() => setIsOpen(true)} style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {mounted && cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </button>

          {mounted && user ? (
            <div className={styles.accountWrapper} ref={accountMenuRef}>
              <button 
                className={`${styles.iconButton} ${isAccountMenuOpen ? styles.accountActive : ''}`} 
                aria-label="Account"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              
              {isAccountMenuOpen && (
                <div className={styles.accountDropdown}>
                  <Link href="/account?section=orders" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>
                    Orders
                  </Link>
                  <Link href="/wishlist" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>
                    Wishlist
                  </Link>
                  <Link href="/account" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>
                    My Profile
                  </Link>
                  <button className={styles.accountDropdownItem} onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.iconButton} aria-label="Login" onClick={openLoginModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
