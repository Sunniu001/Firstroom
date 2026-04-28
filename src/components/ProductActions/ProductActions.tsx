'use client';

import React, { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { addToCart } from '@/lib/api/cart';
import { NormalizedProduct } from '@/types/product';
import { FrameSizeSelector } from '../FrameSizeSelector/FrameSizeSelector';
import { NameplatePersonalizer, NameplateData } from '../NameplatePersonalizer/NameplatePersonalizer';
import { WishlistModal } from '../WishlistModal/WishlistModal';
import styles from './ProductActions.module.css';

interface ProductActionsProps {
  product: NormalizedProduct;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const { cartToken, setCart, setCartToken, setIsOpen } = useCartStore();
  const { isInAnyList } = useWishlistStore();

  const isWished = isInAnyList(product.id);
  const isWallpaper = product.isWallpaper;
  const isNameplate = product.isNameplate;

  // Nameplate State
  const [nameplateData, setNameplateData] = useState<NameplateData>({
    name: '',
    font: "'Dancing Script', cursive"
  });

  // Wallpaper State
  const [height, setHeight] = useState<string>('5');
  const [width, setWidth] = useState<string>('5');
  const [quantity, setQuantity] = useState(1);
  const materials = product.attributes?.find(a => (a.name || '').toLowerCase() === 'material')?.options || [];
  const [selectedMaterial, setSelectedMaterial] = useState<string>(materials[0] || '');

  const isVariable = product.variants && product.variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    isVariable && product.variants ? product.variants[0].id : null
  );

  // Pricing Logic
  let basePrice = parseFloat(product.price.amount);
  
  if (isVariable && selectedVariantId && product.variants) {
    const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
    if (selectedVariant && selectedVariant.price) {
      basePrice = selectedVariant.price;
    }
  }
  // Only calculate area if it is a wallpaper
  let area = 0;
  let displayArea = 0;
  let totalPrice = 0;
  
  if (isWallpaper) {
    const h = parseFloat(height) || 0;
    const w = parseFloat(width) || 0;
    area = h * w;
    displayArea = area;
    totalPrice = area > 0 ? area * basePrice * quantity : 0;
  } else {
    // For normal products, total price is just base * quantity
    totalPrice = basePrice * quantity;
  }

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      
      let variationPayload;
      if (isVariable && selectedVariantId && product.variants) {
        const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
        if (selectedVariant && selectedVariant.attributes) {
          variationPayload = Object.entries(selectedVariant.attributes || {}).map(([key, value]) => ({
            attribute: key,
            value: value as string,
          }));
        }
      }
      
      let customData;
      if (isNameplate) {
        customData = {
          'Name': nameplateData.name,
          'Font': nameplateData.font
        };
      }
      
      const { cart: newCart, cartToken: newCartToken } = await addToCart(cartToken, product.id, quantity, variationPayload, customData);
      setCart(newCart);
      setCartToken(newCartToken);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };


  return (
    <div className={styles.wallpaperActions}>
      {isWallpaper && (
        <>
          <div className={styles.dimensionsSection}>
            <h3 className={styles.sectionTitle}>Enter Dimensions <span className={styles.sectionHint}>(Minimum Order: 25 Sq.Ft.)</span></h3>
            <div className={styles.inputsRow}>
              <div className={styles.inputGroup}>
                <label>Height (feet) <span className={styles.required}>*</span></label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} min="1" step="0.1" className={styles.inputField} />
              </div>
              <div className={styles.inputGroup}>
                <label>Width (feet) <span className={styles.required}>*</span></label>
                <input type="number" value={width} onChange={e => setWidth(e.target.value)} min="1" step="0.1" className={styles.inputField} />
              </div>
            </div>
            <p className={styles.totalArea}>Total Area: <strong>{displayArea.toFixed(2)}</strong> sq.ft.</p>
            {displayArea > 0 && displayArea < 25 && (
              <p className={styles.errorText}>Minimum order is 25 sq.ft. Please increase dimensions.</p>
            )}
          </div>

          {materials.length > 0 && (
            <div className={styles.materialSection}>
              <h3 className={styles.sectionTitle}>Material</h3>
              <div className={styles.materialOptions}>
                {materials.map(mat => (
                  <button 
                    key={mat} 
                    className={`${styles.materialBtn} ${selectedMaterial === mat ? styles.selectedMaterial : ''}`}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isNameplate && (
        <NameplatePersonalizer
          productImage={product.nameplateMeta?.bg || product.images[0]?.url || ''}
          nameplateMeta={product.nameplateMeta}
          data={nameplateData}
          onChange={setNameplateData}
        />
      )}

      {!isNameplate && isVariable && product.variants && (
        <FrameSizeSelector 
          variants={product.variants} 
          selectedVariantId={selectedVariantId} 
          onSelect={setSelectedVariantId} 
        />
      )}

      <div className={styles.priceRow}>
        <div className={styles.totalPriceDisplay}>
          Total: <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className={styles.quantitySelector}>
           <span className={styles.qtyLabel}>Quantity:</span>
           <div className={styles.qtyControls}>
             <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={styles.qtyBtn}>-</button>
             <span className={styles.qtyValue}>{quantity}</span>
             <button onClick={() => setQuantity(quantity + 1)} className={styles.qtyBtn}>+</button>
           </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button 
          className={styles.addToCartBtn} 
          onClick={handleAddToCart}
          disabled={!product.availableForSale || isAdding || (isWallpaper && area < 25) || (isNameplate && !nameplateData.name.trim())}
        >
          {isAdding ? 'ADDING...' : product.availableForSale ? '🛒 ADD TO CART' : 'OUT OF STOCK'}
        </button>
        <button 
          className={styles.wishlistBtn}
          onClick={() => setShowWishlistModal(true)}
        >
          {isWished ? '♥ WISHLISTED' : '♡ ADD TO WISHLIST'}
        </button>
      </div>

      {showWishlistModal && (
        <WishlistModal
          item={{
            productId: product.id,
            title: product.title,
            handle: product.handle,
            image: product.images[0]?.url || '',
            price: product.price.amount,
            currencyCode: product.price.currencyCode,
            availableForSale: product.availableForSale,
          }}
          onClose={() => setShowWishlistModal(false)}
        />
      )}

      <div className={styles.footerNotes}>
        <span className={styles.footerNote}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Free Shipping
        </span>
        <span className={styles.footerNote}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
          15 days return policy
        </span>
        <span className={styles.footerNote}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          100% Original Product
        </span>
      </div>
    </div>
  );
};
