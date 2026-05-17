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

  // Extract the WooCommerce attribute name dynamically from the first variant
  const firstVariantAttrs = variants[0]?.attributes || {};
  const rawAttributeName = Object.keys(firstVariantAttrs)[0] || 'Size';
  
  // Format the label beautifully (e.g. "pa_frame-size" -> "Frame Size", "pa_size" -> "Size")
  const displayLabel = rawAttributeName
    .replace(/^pa_/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={styles.container}>
      <span className={styles.label}>{displayLabel}</span>
      <div className={styles.optionsContainer}>
        {variants.map((variant) => {
          const attrs = variant.attributes || {};
          const sizeLabel = attrs[rawAttributeName] || Object.values(attrs)[0] || `Variant ${variant.id}`;
          
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
