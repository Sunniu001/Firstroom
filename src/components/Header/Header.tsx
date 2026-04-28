'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import styles from './Header.module.css';

/* ─── Social-bar icons ───────────────────────────────────── */

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const PinterestIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02L6.62 10.79z" />
  </svg>
);

/* ─── Nav / action icons ─────────────────────────────────── */

const SearchIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HeartIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BagIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Component ──────────────────────────────────────────── */

import { SearchDrawer } from './SearchDrawer';

export const Header: React.FC = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);


  const { cart, setIsOpen } = useCartStore();
  const { lists } = useWishlistStore();
  const { user, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
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

      {/* ── Top social bar ──────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.socialLinks}>
            <a
              href="https://www.instagram.com/firstroom.in"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.pinterest.com/firstroom0001/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Pinterest"
            >
              <PinterestIcon />
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=%2B919650706644&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <span className={styles.topBarDivider} />
            <a href="tel:+919310845706" className={styles.phoneLink}>
              <PhoneIcon />
              <span>093108 45706</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Main nav bar ────────────────────────────────────── */}
      <div className={styles.mainBar}>
        <div className={styles.container}>

          {/* Logo */}
          <div className={styles.left}>
            <Link href="/" className={styles.logoContainer} aria-label="First Room Collective – home">
              <Image
                src="/images/Logo.png"
                alt="First Room Collective"
                width={200}
                height={56}
                priority
                style={{ objectFit: 'contain', width: 'auto', height: '56px' }}
              />
            </Link>
          </div>

          {/* Nav */}
          <div className={styles.center}>
            <nav className={styles.nav} aria-label="Main navigation">

              <div className={styles.navItem}>
                <Link href="/category/wallpapers" className={styles.navLink}>WALLPAPER</Link>
                <div className={styles.dropdown}>
                  <Link href="/category/artistic-wallpaper" className={styles.dropdownItem}>Artistic</Link>
                  <Link href="/category/botanical-rhythm-wallpaper" className={styles.dropdownItem}>Botanical Rhythm</Link>
                  <Link href="/category/inner-landscape-wallpaper" className={styles.dropdownItem}>Inner Landscape</Link>
                  <Link href="/category/motif-impression-wallpaper" className={styles.dropdownItem}>Motif Impression</Link>
                  <Link href="/category/timeless-wallpaper" className={styles.dropdownItem}>Timeless</Link>
                  <Link href="/category/tropical-wallpaper" className={styles.dropdownItem}>Tropical</Link>
                  <Link href="/category/kids-wallpaper" className={styles.dropdownItem}>Kids</Link>

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

          {/* Action icons */}
          <div className={styles.right}>
            <button 
              className={styles.iconButton} 
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon />
            </button>


            <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist" style={{ position: 'relative' }}>
              <HeartIcon />
              {mounted && wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </Link>

            <button
              className={styles.iconButton}
              aria-label="Shopping bag"
              onClick={() => setIsOpen(true)}
              style={{ position: 'relative' }}
            >
              <BagIcon />
              {mounted && cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </button>

            {mounted && user ? (
              <div className={styles.accountWrapper} ref={accountMenuRef}>
                <button
                  className={`${styles.iconButton} ${isAccountMenuOpen ? styles.accountActive : ''}`}
                  aria-label="My account"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                >
                  <UserIcon />
                </button>
                {isAccountMenuOpen && (
                  <div className={styles.accountDropdown}>
                    <Link href="/account?section=orders" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>Orders</Link>
                    <Link href="/wishlist" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>Wishlist</Link>
                    <Link href="/account" className={styles.accountDropdownItem} onClick={() => setIsAccountMenuOpen(false)}>My Profile</Link>
                    <button className={styles.accountDropdownItem} onClick={handleLogout}>Log out</button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.iconButton} aria-label="Login" onClick={openLoginModal}>
                <UserIcon />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={styles.mobileMenuToggle} 
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuInner}>
          <nav className={styles.mobileNav}>
            <Link href="/category/wallpapers" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>WALLPAPER</Link>
            <Link href="/category/home-decor" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>HOME DECOR</Link>
            <Link href="/custom-design" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>CUSTOM DESIGN</Link>
            <Link href="/our-story" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>OUR STORY</Link>
            <Link href="/contact" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</Link>
          </nav>
        </div>
      </div>
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>

  );
};
