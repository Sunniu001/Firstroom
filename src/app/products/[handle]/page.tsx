import React from 'react';
import { getProductBySlug, getProducts } from '@/lib/api/products';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { ProductActions } from '@/components/ProductActions/ProductActions';
import { ProductGallery } from '@/components/ProductGallery/ProductGallery';
import { ProductAccordion } from '@/components/ProductAccordion/ProductAccordion';
import { SocialShare } from '@/components/SocialShare/SocialShare';
import { ProductFeatures } from '@/components/ProductFeatures/ProductFeatures';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import { Product, NormalizedProduct } from '@/types/product';

export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 });
  return products.map((product) => ({
    handle: product.slug,
  }));
}

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

function mapToLegacyProduct(product: Product): NormalizedProduct {
  return {
    id: product.id.toString(),
    handle: product.slug,
    title: product.name,
    description: product.description,
    descriptionHtml: product.description,
    price: {
      amount: product.price.toString(),
      currencyCode: 'INR',
    },
    availableForSale: product.stockStatus === 'instock',
    images: product.images.map(img => ({ url: img.src, altText: img.alt })),
    categories: product.categories.map(c => c.name),
    isWallpaper: product.categories.some(c => c.slug.includes('wallpaper') || c.name.toLowerCase().includes('wallpaper')),
    isNameplate: product.categories.some(c => c.slug.includes('nameplate') || c.name.toLowerCase().includes('nameplate')),
    nameplateMeta: product.nameplateMeta,
    attributes: product.attributes,
    variants: product.variants,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductBySlug(handle);

  if (!product) {
    notFound();
  }

  const legacyProduct = mapToLegacyProduct(product);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
        <div className={styles.container}>
          <ProductGallery images={legacyProduct.images} />
          
          <div className={styles.productInfo}>
            <div className={styles.categories}>
              {legacyProduct.categories.join(', ')}
            </div>
            <h1 className={styles.title}>{legacyProduct.title}</h1>
            <p className={styles.price}>
              ₹{legacyProduct.price.amount} {legacyProduct.isWallpaper && <span style={{fontSize: '0.8rem', color: '#666', fontWeight: 400}}>/ sq. ft.</span>}
            </p>

            <ProductActions product={legacyProduct} />
          </div>
        </div>
        
        {/* Bottom Sections */}
        <ProductAccordion 
          description={legacyProduct.descriptionHtml || legacyProduct.description} 
          categories={legacyProduct.categories}
        />
        <SocialShare />
        <ProductFeatures />
        
      </main>

      <Footer />
    </div>
  );
}
