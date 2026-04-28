import React from 'react';
import styles from './FrameSizeSelector.module.css';
import { ProductVariant } from '@/types/product';

interface FrameSizeSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: number | null;
  onSelect: (variantId: number) => void;
}

export const FrameSizeSelector: React.FC<FrameSizeSelectorProps> = ({
  variants,
  selectedVariantId,
  onSelect,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Frame Size</span>
      <div className={styles.optionsContainer}>
        {variants.map((variant) => {
          const attrs = variant.attributes || {};
          const sizeLabel = attrs['Frame Size'] || Object.values(attrs)[0] || `Variant ${variant.id}`;
          
          return (
            <button
              key={variant.id}
              className={`${styles.sizeButton} ${selectedVariantId === variant.id ? styles.selected : ''}`}
              onClick={() => onSelect(variant.id)}
              aria-pressed={selectedVariantId === variant.id}
            >
              {String(sizeLabel).replace(/-/g, ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
