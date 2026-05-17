import type { BillingDetails, CheckoutResult } from './cart';

interface CheckoutCartItemInput {
  id: string;
  productId: string;
  variationId?: number;
  quantity: number;
  customData?: Record<string, string>;
}

export async function placeOrderClient(
  cartToken: string,
  billing: BillingDetails,
  selectedItemKeys: string[],
  allItems: CheckoutCartItemInput[],
  paymentMethod: string = 'razorpay',
  authToken?: string,
  customerId?: number
): Promise<CheckoutResult> {
  const selectedItems = allItems.filter((item) => selectedItemKeys.includes(item.id));

  if (!selectedItems.length) {
    throw new Error('No cart items selected for checkout.');
  }

  const response = await fetch('/api/checkout/selected', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      cartToken,
      billing,
      selectedItemKeys,
      cartItems: selectedItems.map((item) => ({
        key: item.id,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        customData: item.customData,
      })),
      paymentMethod,
      authToken,
      customerId,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.message || 'Could not place selected checkout order.');
  }

  return {
    orderId: result.orderId,
    orderKey: result.orderKey,
    paymentRedirectUrl: result.paymentRedirectUrl || null,
    status: result.status || 'pending',
    cartCleanup: result.cartCleanup,
  };
}
