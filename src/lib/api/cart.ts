'use server';

import { fetchStoreApi } from './client';
import { StoreCart, NormalizedCart } from '@/types/product';

function normalizeCart(storeCart: StoreCart): NormalizedCart {
  // Minor units define decimal placement. Usually 2 for most currencies.
  const minorUnit = storeCart.totals.currency_minor_unit || 2;
  const divisor = Math.pow(10, minorUnit);

  return {
    id: storeCart.cart_token,
    totalQuantity: storeCart.items.length,
    items: storeCart.items.map((item) => {
      let customData: Record<string, string> | undefined;
      
      // Check standard item_data
      if (item.item_data && Array.isArray(item.item_data)) {
        customData = item.item_data.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);
      }
      
      // Fallback to extensions if available
      const extensions = (item as any).extensions;
      if (!customData && extensions?.custom_data) {
        customData = extensions.custom_data;
      }
      
      const sku = item.sku || '';
      const isWallpaper = (customData && Object.keys(customData).some(k => k.toLowerCase().includes('area'))) || 
                         sku.startsWith('FMWPAR') || 
                         item.name.toLowerCase().includes('shade');

      return {
        id: item.key,
        productId: String(item.id),
        quantity: item.quantity,
        title: item.name,
        image: item.images?.[0]?.src || '',
        sku: sku,
        isWallpaper: isWallpaper,
        price: {
          amount: String(parseInt(item.prices.price) / divisor),
          currencyCode: item.prices.currency_code,
        },
        customData
      };
    }),
    cost: {
      subtotalAmount: {
        amount: String(parseInt(storeCart.totals.total_items) / divisor),
        currencyCode: storeCart.totals.currency_code,
      },
      totalAmount: {
        amount: String(parseInt(storeCart.totals.total_price) / divisor),
        currencyCode: storeCart.totals.currency_code,
      },
    },
  };
}

export async function getCart(cartToken: string | null): Promise<NormalizedCart | null> {
  if (!cartToken) return null;

  try {
    const { data } = await fetchStoreApi<StoreCart>('cart', cartToken);
    return normalizeCart(data);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export async function addToCart(
  cartToken: string | null,
  productId: string,
  quantity: number = 1,
  variation?: Array<{ attribute: string; value: string }>,
  customData?: Record<string, string>
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  let activeToken = cartToken;
  let activeNonce: string | null = null;
  
  // 1. Ensure we have a valid token and a fresh nonce
  const sessionRes = await fetchStoreApi<StoreCart>('cart', activeToken);
  activeToken = sessionRes.cartToken;
  activeNonce = sessionRes.nonce;

  const payload: any = {
    id: productId,
    quantity,
  };
  
  if (variation) {
    payload.variation = variation;
  }
  
  if (customData) {
    payload.item_data = Object.entries(customData).map(([key, value]) => ({ key, value }));
    payload.extensions = { 
      ...payload.extensions, 
      custom_data: customData,
      metadata: Object.entries(customData).map(([key, value]) => ({ key, value }))
    };
  }

  // 2. Perform the add-item operation with the LATEST token and nonce
  const { data, cartToken: newCartToken } = await fetchStoreApi<StoreCart>('cart/add-item', activeToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, activeNonce);

  return {
    cart: normalizeCart(data),
    cartToken: (newCartToken || activeToken) as string,
  };
}

export async function updateCartItem(
  cartToken: string,
  itemKey: string,
  quantity: number
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  // 1. Fetch latest token and fresh nonce
  const { nonce, cartToken: latestToken } = await fetchStoreApi<StoreCart>('cart', cartToken);
  const activeToken = latestToken || cartToken;

  const { data, cartToken: newToken } = await fetchStoreApi<StoreCart>('cart/update-item', activeToken, {
    method: 'POST',
    body: JSON.stringify({
      key: itemKey,
      quantity,
    }),
  }, nonce);

  return {
    cart: normalizeCart(data),
    cartToken: (newToken || activeToken) as string,
  };
}

export async function removeCartItem(
  cartToken: string,
  itemKey: string
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  // 1. Fetch latest token and fresh nonce
  const { nonce, cartToken: latestToken } = await fetchStoreApi<StoreCart>('cart', cartToken);
  const activeToken = latestToken || cartToken;

  const { data, cartToken: newToken } = await fetchStoreApi<StoreCart>('cart/remove-item', activeToken, {
    method: 'POST',
    body: JSON.stringify({
      key: itemKey,
    }),
  }, nonce);

  return {
    cart: normalizeCart(data),
    cartToken: (newToken || activeToken) as string,
  };
}

export interface BillingDetails {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string; // This will be Billing Email
  phone: string;
  account_email?: string; // This will be Account Email
  password?: string;
}

export interface CheckoutResult {
  orderId: number;
  orderKey: string;
  paymentRedirectUrl: string | null;
  status: string;
}

/**
 * Selective checkout strategy:
 * 1. Temporarily remove unselected items from WooCommerce cart
 * 2. POST to /checkout with only the selected items
 * 3. Re-add the removed items back to the cart
 */
export async function placeOrder(
  cartToken: string,
  billing: BillingDetails,
  selectedItemKeys: string[],
  allItems: Array<{ id: string; productId: string; quantity: number; customData?: Record<string, string> }>,
  paymentMethod: string = 'razorpay',
  authToken?: string
): Promise<CheckoutResult> {
  // Step 0: Fetch the cart to obtain the Nonce header required for checkout POST
  const { nonce, cartToken: freshToken } = await fetchStoreApi<StoreCart>('cart', cartToken);
  let tempToken = freshToken || cartToken;

  // Step 1: Find items to temporarily remove (unselected)
  const itemsToRemove = allItems.filter(item => !selectedItemKeys.includes(item.id));

  // Step 2: Remove unselected items from the WC cart
  for (const item of itemsToRemove) {
    const { cartToken: updatedToken } = await fetchStoreApi<StoreCart>('cart/remove-item', tempToken, {
      method: 'POST',
      body: JSON.stringify({ key: item.id }),
    }, nonce);
    if (updatedToken) tempToken = updatedToken;
  }

  // Step 3: Place the order with selected items only
  // Build a customer note that includes custom dimensions if they exist
  let note = '';
  const wallpaperItems = allItems.filter(item => selectedItemKeys.includes(item.id) && item.customData);
  
  if (wallpaperItems.length > 0) {
    note = 'PRODUCT CUSTOMIZATIONS:\n';
    wallpaperItems.forEach(item => {
      note += `- ${item.title}:\n`;
      if (item.customData) {
        Object.entries(item.customData).forEach(([key, value]) => {
          note += `  ${key}: ${value}\n`;
        });
      }
    });
    note += '\n';
  }

  const checkoutPayload = {
    billing_address: { ...billing },
    shipping_address: { ...billing },
    payment_method: paymentMethod === 'razorpay' ? 'cod' : paymentMethod,
    payment_data: [],
    customer_note: note.trim(),
  };

  let orderResult: any;
  try {
    const headers: any = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const { data } = await fetchStoreApi<any>('checkout', tempToken, {
      method: 'POST',
      headers,
      body: JSON.stringify(checkoutPayload),
    }, nonce);
    orderResult = data;
  } finally {
    // Step 4: Re-add the temporarily removed items back to the cart (best effort)
    for (const item of itemsToRemove) {
      try {
        await fetchStoreApi<StoreCart>('cart/add-item', tempToken, {
          method: 'POST',
          body: JSON.stringify({
            id: item.productId,
            quantity: item.quantity,
            ...(item.customData ? { item_data: item.customData } : {}),
          }),
        }, nonce);
      } catch {
        // Non-fatal: the order was placed successfully
      }
    }
  }

  return {
    orderId: orderResult?.order_id,
    orderKey: orderResult?.order_key,
    paymentRedirectUrl: orderResult?.payment_result?.redirect_url || null,
    status: orderResult?.status || 'pending',
  };
}
