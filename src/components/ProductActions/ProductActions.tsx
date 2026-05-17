'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { addToCart, updateCartItem } from '@/lib/api/cart';
import { Product } from '@/types/product';
import { FrameSizeSelector } from '../FrameSizeSelector/FrameSizeSelector';
import { NameplatePersonalizer, NameplateData } from '../NameplatePersonalizer/NameplatePersonalizer';
import { WishlistModal } from '../WishlistModal/WishlistModal';
import styles from './ProductActions.module.css';

interface ProductActionsProps {
  product: Product;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const { cart, cartToken, setCart, setCartToken, setIsOpen } = useCartStore();
  const { isInAnyList } = useWishlistStore();

  const productId = String(product.id);
  const isWished = isInAnyList(productId);
  const isWallpaper = product.categories.some(
    (category) => (category.slug || '').includes('wallpaper') || (category.name || '').toLowerCase().includes('wallpaper')
  );
  const isNameplate = product.categories.some(
    (category) => (category.slug || '').includes('nameplate') || (category.name || '').toLowerCase().includes('nameplate')
  );

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
  let basePrice = product.price;
  
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
      
      let customData: Record<string, string> | undefined;
      if (isNameplate) {
        customData = {
          'Name': nameplateData.name,
          'Font': nameplateData.font
        };
      } else if (isWallpaper) {
        customData = {
          'Height': height,
          'Width': width,
          'Area': displayArea.toFixed(2),
          'Material': selectedMaterial
        };
      }
      if (selectedVariantId) {
        customData = {
          ...(customData || {}),
          _variation_id: String(selectedVariantId),
        };
      }
      
      // For wallpapers, if the unit price is per sq ft, we need to send the total area as quantity 
      // if the backend isn't configured to calculate price from metadata.
      // However, if we want to keep the quantity as "units of wallpaper", 
      // we'd need a backend plugin to handle the price calculation.
      // Cart Splitting Logic: For wallpapers, we treat different dimensions as separate items.
      // Use numeric parsing to ensure "5" and "5.00" match.
      const existingItem = isWallpaper ? cart?.items.find(item => {
        if (item.productId !== productId) return false;
        
        // Normalize keys to lowercase for comparison
        const meta: Record<string, string> = {};
        if (item.customData) {
          Object.entries(item.customData).forEach(([k, v]) => {
            meta[k.toLowerCase()] = String(v);
          });
        }

        const sameHeight = parseFloat(meta['height'] || '0') === parseFloat(height);
        const sameWidth = parseFloat(meta['width'] || '0') === parseFloat(width);
        const sameMaterial = (meta['material'] || '').toLowerCase() === selectedMaterial.toLowerCase();

        return sameHeight && sameWidth && sameMaterial;
      }) : null;

      const finalQuantity = isWallpaper ? quantity * displayArea : quantity;

      if (existingItem && cartToken) {
        // Update existing line item quantity
        const newQuantity = existingItem.quantity + finalQuantity;
        const { cart: updatedCart, cartToken: newCartToken } = await updateCartItem(cartToken, existingItem.id, newQuantity);
        if (customData) {
           useCartStore.getState().setLocalItemData(existingItem.id, customData);
        }
        setCart(updatedCart);
        setCartToken(newCartToken);
        setIsOpen(true);
      } else {
        // Add as new line item (or first time)
        const oldCartKeys = cart?.items.map(i => i.id) || [];
        const { cart: newCart, cartToken: newCartToken } = await addToCart(cartToken, productId, finalQuantity, variationPayload, customData);
        if (customData && newCart) {
           const newItem = newCart.items.find(i => !oldCartKeys.includes(i.id));
           if (newItem) {
              useCartStore.getState().setLocalItemData(newItem.id, customData);
           }
        }
        setCart(newCart);
        setCartToken(newCartToken);
        setIsOpen(true);
      }
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

      {isVariable && product.variants && (
        <FrameSizeSelector 
          variants={product.variants} 
          selectedVariantId={selectedVariantId} 
          onSelect={setSelectedVariantId} 
        />
      )}

      {isNameplate && (
        <NameplatePersonalizer
          productImage={product.nameplateMeta?.bg || product.images[0]?.src || ''}
          nameplateMeta={product.nameplateMeta}
          data={nameplateData}
          onChange={setNameplateData}
        />
      )}

      <div className={styles.priceRow}>
        <div className={styles.totalPriceDisplay}>
          Total: <span>₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        {!isWallpaper && (
          <div className={styles.quantitySelector}>
            <span className={styles.qtyLabel}>Quantity:</span>
            <div className={styles.qtyControls}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={styles.qtyBtn}>-</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className={styles.qtyBtn}>+</button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.actionButtons}>
        <button 
          className={styles.addToCartBtn} 
          onClick={handleAddToCart}
          disabled={product.stockStatus !== 'instock' || isAdding || (isWallpaper && area < 25) || (isNameplate && !nameplateData.name.trim())}
        >
          {isAdding ? 'ADDING...' : product.stockStatus === 'instock' ? '🛒 ADD TO CART' : 'OUT OF STOCK'}
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
            productId,
            title: product.name,
            handle: product.slug,
            image: product.images[0]?.src || '',
            price: product.price.toString(),
            currencyCode: 'INR',
            availableForSale: product.stockStatus === 'instock',
          }}
          onClose={() => setShowWishlistModal(false)}
        />
      )}

      {/* Footer Notes (Intentionally removed to keep actions layout minimalist & clean) */}
    </div>
  );
};
