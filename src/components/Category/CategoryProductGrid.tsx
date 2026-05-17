'use client';

import React, { useState } from 'react';
import { Product } from '@/types/product';
import { Grid } from '@/components/Grid/Grid';
import { Card } from '@/components/Card/Card';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface CategoryProductGridProps {
  products: Product[];
  unit?: string;
  showCategory?: boolean;
}

export const CategoryProductGrid: React.FC<CategoryProductGridProps> = ({ products, unit, showCategory }) => {


  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get('sort') || 'price_asc';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1'); // Reset to page 1 on sort change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", paddingRight: "5px" }}>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          style={{ 
            background: "transparent", 
            border: "none", 
            padding: "0", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            opacity: 0.8 
          }}
        >
          <span style={{ marginRight: "10px", fontSize: "14px", fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Filter</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1">
            <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {showFilters && (
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#fcfcfc", 
          marginBottom: "30px", 
          border: "1px solid #eee",
          display: "flex",
          gap: "40px",
          animation: "slideDown 0.3s ease-out"
        }}>
          <div>
            <h4 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", color: "#666" }}>Sort By</h4>
            <select 
              value={currentSort}
              onChange={handleSortChange}
              style={{ 
                padding: "10px 15px", 
                border: "1px solid #ddd", 
                background: "#fff", 
                fontSize: "14px",
                fontFamily: "var(--font-sans)",
                minWidth: "200px",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popularity">Popularity</option>
              <option value="date">Newest First</option>
            </select>
          </div>
        </div>
      )}

      <Grid columns={4} gap="md">
        {products.map((product) => {
          const displayPrice = (() => {
            if (product.variants && product.variants.length > 0) {
              const prices = product.variants.map(v => v.price).filter(p => typeof p === 'number' && !isNaN(p) && p > 0);
              if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`;
              }
            }
            return `₹${product.price}`;
          })();

          return (
            <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card
                title={product.name}
                price={displayPrice}
                category={showCategory ? product.categories?.[0]?.name : undefined}
                unit={unit}
                image={product.images?.[0]?.src}
              />
            </Link>
          );
        })}

      </Grid>

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
