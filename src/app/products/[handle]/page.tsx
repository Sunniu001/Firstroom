export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import React from 'react';
import { getProductBySlug } from '@/lib/api/products';
import { ProductActions } from '@/components/ProductActions/ProductActions';
import { ProductGallery } from '@/components/ProductGallery/ProductGallery';
import Link from 'next/link';
import { ProductAccordion } from '@/components/ProductAccordion/ProductAccordion';

import { SocialShare } from '@/components/SocialShare/SocialShare';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | First Room`,
    description: product.shortDescription || product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) {
    notFound();
  }

  const isWallpaper = product.categories.some(
    (category) => (category.slug || '').includes('wallpaper') || (category.name || '').toLowerCase().includes('wallpaper')
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main className={styles.main}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/">Home</Link>
          <span className={styles.separator}>/</span>
          {product.categories && product.categories.length > 0 ? (
            <>
              <Link href={`/category/${product.categories[0].slug}`}>
                {product.categories[0].name}
              </Link>
              <span className={styles.separator}>/</span>
            </>
          ) : (
            <>
              <Link href="/category/wallpapers">Wallpapers</Link>
              <span className={styles.separator}>/</span>
            </>
          )}
          <span className={styles.current}>{product.name}</span>
        </div>

        <div className={styles.container}>
          <div className={styles.galleryWrapper}>
            <ProductGallery images={product.images.map((image) => ({ url: image.src, altText: image.alt }))} />
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>
              {(() => {
                if (product.variants && product.variants.length > 0) {
                  const prices = product.variants.map(v => v.price).filter(p => typeof p === 'number' && !isNaN(p) && p > 0);
                  if (prices.length > 0) {
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    return minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${minPrice}`;
                  }
                }
                return `₹${product.price}`;
              })()}
              {isWallpaper && <span className={styles.unit}>/sqft</span>}
            </p>

            <ProductActions product={product} />
          </div>
        </div>

        <ProductAccordion
          description={product.description || ''}
          categories={product.categories.map((category) => category.name)}
        />
        <SocialShare />
      </main>
    </div>
  );
}
