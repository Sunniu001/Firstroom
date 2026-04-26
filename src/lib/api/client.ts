import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const storeUrl = process.env.NEXT_PUBLIC_WC_STORE_URL || 'https://sunniy.com';
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || '';

// Initialize the WooCommerce REST API client for catalog operations
export const api = new WooCommerceRestApi({
  url: storeUrl,
  consumerKey: WC_CONSUMER_KEY,
  consumerSecret: WC_CONSUMER_SECRET,
  version: 'wc/v3',
  queryStringAuth: true, // Required for many hosting environments to generate OAuth signatures
});

export async function wcFetch(endpoint: string, params: Record<string, any> = {}) {
  try {
    const response = await api.get(endpoint, params);
    return response.data;
  } catch (error: any) {
    console.error(`WooCommerce API Error on ${endpoint}:`, error.response?.data || error.message);
    throw new Error(`WooCommerce API error: ${error.response?.status || 500}`);
  }
}

/**
 * Client for WooCommerce Store API (v1)
 * Used for Cart, Checkout, etc.
 * Uses Cart-Token header to maintain session.
 */
export async function fetchStoreApi<T>(
  endpoint: string,
  cartToken?: string | null,
  options?: RequestInit,
  nonce?: string | null
): Promise<{ data: T; cartToken: string | null; nonce: string | null }> {
  // Use the main domain for store API
  const url = `${storeUrl}/wp-json/wc/store/v1/${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (cartToken) {
    defaultHeaders['Cart-Token'] = cartToken;
  }

  if (nonce) {
    defaultHeaders['Nonce'] = nonce;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    // Cart operations should never be cached
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    let message = response.statusText;
    try {
      const parsed = JSON.parse(body);
      if (parsed.message) message = parsed.message;
    } catch {}
    throw new Error(`WooCommerce Store API Error: ${message} at ${endpoint}`);
  }

  const returnedCartToken = response.headers.get('Cart-Token') || cartToken || null;
  const returnedNonce = response.headers.get('Nonce') || nonce || null;
  const data = await response.json();

  return { data, cartToken: returnedCartToken, nonce: returnedNonce };
}
