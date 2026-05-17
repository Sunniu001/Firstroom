import { NextRequest, NextResponse } from 'next/server';
import { fetchStoreApi, wcFetch } from '@/lib/api/client';
import type { BillingDetails } from '@/lib/api/cart';
import { StoreCart } from '@/types/product';

interface CheckoutCartItem {
  key: string;
  productId: string;
  variationId?: number;
  quantity: number;
  customData?: Record<string, string>;
}

interface CheckoutPayload {
  cartToken: string;
  billing: BillingDetails;
  selectedItemKeys: string[];
  cartItems: CheckoutCartItem[];
  paymentMethod: string;
  authToken?: string;
  customerId?: number;
}

function parsePositiveInt(value: string | number | undefined): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
}

function normalizeBillingAddress(billing: BillingDetails) {
  return {
    first_name: billing.first_name || '',
    last_name: billing.last_name || '',
    company: billing.company || '',
    address_1: billing.address_1 || '',
    address_2: billing.address_2 || '',
    city: billing.city || '',
    state: billing.state || '',
    postcode: billing.postcode || '',
    country: billing.country || 'IN',
    email: billing.email || '',
    phone: billing.phone || '',
  };
}

function mapPaymentMethod(method: string): string {
  // Keep existing behavior for Razorpay flow where payment capture happens after order creation.
  if (method === 'razorpay') {
    return 'cod';
  }
  return method || 'cod';
}

async function removePurchasedItemsFromCart(
  cartToken: string,
  itemKeys: string[],
  authToken?: string
): Promise<{ removedItemKeys: string[]; failedItemKeys: string[] }> {
  const removedItemKeys: string[] = [];
  const failedItemKeys: string[] = [];

  if (!itemKeys.length) {
    return { removedItemKeys, failedItemKeys };
  }

  const authHeaders: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const session = await fetchStoreApi<StoreCart>('cart', cartToken, {
    headers: authHeaders,
  });

  let activeToken = session.cartToken || cartToken;
  let activeNonce = session.nonce;

  for (const itemKey of itemKeys) {
    let removed = false;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { cartToken: updatedToken, nonce: updatedNonce } = await fetchStoreApi<StoreCart>(
          'cart/remove-item',
          activeToken,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ key: itemKey }),
          },
          activeNonce
        );

        if (updatedToken) activeToken = updatedToken;
        if (updatedNonce) activeNonce = updatedNonce;

        removedItemKeys.push(itemKey);
        removed = true;
        break;
      } catch {
        if (attempt === 0) {
          try {
            const refreshedSession = await fetchStoreApi<StoreCart>('cart', activeToken, {
              headers: authHeaders,
            });
            activeToken = refreshedSession.cartToken || activeToken;
            activeNonce = refreshedSession.nonce;
          } catch {
            // Allow second attempt to fail and mark this item as failed.
          }
        }
      }
    }

    if (!removed) {
      failedItemKeys.push(itemKey);
    }
  }

  return { removedItemKeys, failedItemKeys };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutPayload;
    const {
      cartToken,
      billing,
      selectedItemKeys,
      cartItems,
      paymentMethod,
      authToken,
      customerId,
    } = body;

    if (!cartToken || !billing || !Array.isArray(selectedItemKeys) || !Array.isArray(cartItems)) {
      return NextResponse.json({ message: 'Invalid checkout payload.' }, { status: 400 });
    }

    const selectedSet = new Set(selectedItemKeys);
    const selectedItems = cartItems.filter((item) => selectedSet.has(item.key));

    if (!selectedItems.length) {
      return NextResponse.json({ message: 'No selected cart items supplied.' }, { status: 400 });
    }

    const lineItems = selectedItems.map((item) => {
      const productId = parsePositiveInt(item.productId);
      if (!productId) {
        throw new Error(`Invalid productId for cart item ${item.key}`);
      }

      const lineItem: {
        product_id: number;
        quantity: number;
        variation_id?: number;
        meta_data?: Array<{ key: string; value: string }>;
      } = {
        product_id: productId,
        quantity: item.quantity,
      };

      const variationId = parsePositiveInt(item.variationId);
      if (variationId) {
        lineItem.variation_id = variationId;
      }

      if (item.customData && Object.keys(item.customData).length > 0) {
        lineItem.meta_data = Object.entries(item.customData)
          .filter(([key]) => !key.startsWith('_'))
          .map(([key, value]) => ({ key: String(key), value: String(value) }));
      }

      return lineItem;
    });

    const normalizedBilling = normalizeBillingAddress(billing);
    const wcPaymentMethod = mapPaymentMethod(paymentMethod);

    // Compile a fallback summary of custom data to append to the order notes
    let customDataNotes = '';
    selectedItems.forEach(item => {
      if (item.customData && Object.keys(item.customData).length > 0) {
        customDataNotes += `\n- Item: ${item.key}\n`;
        Object.entries(item.customData).forEach(([k, v]) => {
          if (!k.startsWith('_')) customDataNotes += `  ${k}: ${v}\n`;
        });
      }
    });

    const orderPayload: Record<string, any> = {
      set_paid: false,
      status: 'pending',
      payment_method: wcPaymentMethod,
      payment_method_title: wcPaymentMethod.toUpperCase(),
      billing: normalizedBilling,
      shipping: normalizedBilling,
      line_items: lineItems,
      customer_note: customDataNotes ? `Customization Details:${customDataNotes}` : '',
    };
    if (customerId) {
      orderPayload.customer_id = customerId;
    }

    console.log('[DEBUG] Sending WooCommerce Order Payload:', JSON.stringify(orderPayload, null, 2));

    const orderData = await wcFetch<Record<string, unknown>>('orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload),
    });

    const cartCleanup = await removePurchasedItemsFromCart(
      cartToken,
      selectedItems.map((item) => item.key),
      authToken
    );

    return NextResponse.json({
      orderId: Number(orderData.id || 0),
      orderKey: String(orderData.order_key || ''),
      status: String(orderData.status || 'pending'),
      paymentRedirectUrl: null,
      cartCleanup,
    });
  } catch (error) {
    console.error('[checkout/selected POST]', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Server error while placing order.' },
      { status: 500 }
    );
  }
}
