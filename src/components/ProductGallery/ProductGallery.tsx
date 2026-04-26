'use client';
import React, { useState } from 'react';
import styles from './ProductGallery.module.css';

interface ProductImage {
  url: string;
  altText: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className={styles.placeholderImage}>No Image Available</div>;
  }

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.thumbnailList}>
        {images.map((img, idx) => (
          <button 
            key={idx} 
            className={`${styles.thumbnailBtn} ${idx === activeIndex ? styles.active : ''}`}
            onClick={() => setActiveIndex(idx)}
          >
            <img src={img.url} alt={img.altText || `Thumbnail ${idx}`} className={styles.thumbnailImg} />
          </button>
        ))}
      </div>
      <div className={styles.mainImageContainer}>
        <img src={images[activeIndex].url} alt={images[activeIndex].altText || 'Main Product Image'} className={styles.mainImg} />
      </div>
    </div>
  );
};
