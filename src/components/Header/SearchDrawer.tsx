'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchDrawer.module.css';
import { Product } from '@/types/product';
import { fetchStoreApi } from '@/lib/api/client';
import Link from 'next/link';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDrawer: React.FC<SearchDrawerProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Strategy 1: Full Phrase Search
        const endpoint = `products?search=${encodeURIComponent(trimmedQuery)}&per_page=10`;
        const { data } = await fetchStoreApi<any>(endpoint);
        let products = Array.isArray(data) ? data : (data?.data || []);
        
        // Strategy 2: If no results and multiple words, try searching for the first word
        if (products.length === 0 && trimmedQuery.includes(' ')) {
          const firstWord = trimmedQuery.split(' ')[0];
          const firstWordRes = await fetchStoreApi<any>(`products?search=${encodeURIComponent(firstWord)}&per_page=10`);
          products = Array.isArray(firstWordRes.data) ? firstWordRes.data : (firstWordRes.data?.data || []);
          // Filter results locally to match the second word if possible
          if (products.length > 0) {
            const secondWord = trimmedQuery.split(' ')[1].toLowerCase();
            const filtered = products.filter((p: any) => p.name.toLowerCase().includes(secondWord));
            if (filtered.length > 0) products = filtered;
          }
        }

        // Strategy 3: WP Core Search Fallback
        if (products.length === 0) {
          const { STORE_URL } = await import('@/lib/api/client');
          const wpSearchUrl = `${STORE_URL}/wp-json/wp/v2/search?type=post&subtype=product&search=${encodeURIComponent(trimmedQuery)}&per_page=5`;
          try {
            const wpRes = await fetch(wpSearchUrl);
            if (wpRes.ok) {
              const wpData = await wpRes.json();
              if (Array.isArray(wpData) && wpData.length > 0) {
                const ids = wpData.map((item: any) => item.id).join(',');
                const productsRes = await fetchStoreApi<any>(`products?include=${ids}`);
                products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data?.data || []);
              }
            }
          } catch (e) { console.warn('WP Search failed', e); }
        }

        // Strategy 4: Slug variations
        if (products.length === 0) {
          const baseSlug = trimmedQuery.toLowerCase().replace(/\s+/g, '-');
          const variations = [baseSlug, `${baseSlug}-wallpaper`, `${baseSlug}-mural`, `${baseSlug}-home-decor`];
          for (const slug of variations) {
            const slugRes = await fetchStoreApi<any>(`products?slug=${slug}&per_page=1`);
            const found = Array.isArray(slugRes.data) ? slugRes.data : (slugRes.data?.data || []);
            if (found.length > 0) { products = found; break; }
          }
        }

        setResults(products);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }







    };


    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.searchBox}>
            <input
              ref={inputRef}
              type="text"
              placeholder="SEARCH"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.input}
            />
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {!query && (
            <div className={styles.suggestionsSection}>
              <h4 className={styles.sectionTitle}>Suggestions</h4>
              <div className={styles.suggestionChips}>
                {['WALLPAPER', 'ARTISTIC', 'BOTANICAL', 'KIDS'].map((tag) => (
                  <button 
                    key={tag} 
                    className={styles.chip}
                    onClick={() => setQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.activeTab}`}>Products</button>
            <button className={styles.tab}>Articles</button>
          </div>

          <div className={styles.resultsList}>
            {isLoading && <div className={styles.loading}>Searching...</div>}
            {!isLoading && results.length > 0 && results.map((product: any) => {
              const imageUrl = product.images?.[0]?.src || 
                              product.images?.[0]?.thumbnail || 
                              product.images?.[0]?.url ||
                              product.image?.src;

              return (
                <Link 
                  key={product.id} 
                  href={`/products/${product.slug}`} 
                  className={styles.resultItem}
                  onClick={onClose}
                >
                  <div className={styles.thumbWrapper}>
                    {imageUrl && (
                      <img src={imageUrl} alt={product.name} className={styles.thumb} />
                    )}
                  </div>
                  <div className={styles.resultInfo}>
                    <h5 className={styles.resultName}>{product.name}</h5>
                    <p className={styles.resultPrice}>
                      {product.price_html ? (
                        <span dangerouslySetInnerHTML={{ __html: product.price_html }} />
                      ) : (
                        `Rs.${product.price}`
                      )}
                    </p>
                  </div>
                </Link>
              );
            })}

            {!isLoading && query.trim().length >= 2 && results.length === 0 && (
              <p className={styles.noResults}>No products found.</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Link 
            href={`/category/wallpapers?search=${query}`} 
            className={styles.viewAllBtn}
            onClick={onClose}
          >
            View all results
          </Link>
        </div>
      </div>
    </div>
  );
};
