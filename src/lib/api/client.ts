export const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
export const STORE_URL = process.env.NEXT_PUBLIC_WC_STORE_URL;

const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

function getAuthHeader(): Record<string, string> {
  if (!WC_KEY || !WC_SECRET) return {};
  // Using btoa for better compatibility across Node and Edge runtimes
  const auth = btoa(`${WC_KEY}:${WC_SECRET}`);
  return { Authorization: `Basic ${auth}` };
}

export async function wcFetch(endpoint: string, options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }) {
  const cleanBaseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const isNoStore = options?.cache === 'no-store' || (!options?.next && !options?.cache);
  
  let url = `${cleanBaseUrl}/${endpoint}`;
  if (isNoStore) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url += `${separator}_cb=${Date.now()}`;
  }
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...options?.headers,
    },
  };

  if (!options?.cache && !options?.next) {
    fetchOptions.cache = 'no-store';
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "No error body");
    throw new Error(`WooCommerce API Error: ${res.status} ${res.statusText} at ${endpoint}. Body: ${errorBody}`);
  }

  return res.json();
}


/**
 * Client for WooCommerce Store API (v1)
 * Used for Cart, Checkout, etc.
 * Uses Cart-Token header to maintain session.
 */
export async function fetchStoreApi<T>(
  endpoint: string,
  cartToken?: string | null,
  options?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
  nonce?: string | null
): Promise<{ data: T; cartToken: string | null; nonce: string | null; headers: Headers }> {
  const cleanBaseUrl = STORE_URL?.endsWith('/') ? STORE_URL.slice(0, -1) : STORE_URL;
  const isNoStore = options?.cache === 'no-store' || (!options?.next && !options?.cache);
  
  let url = `${cleanBaseUrl}/wp-json/wc/store/v1/${endpoint}`;
  if (isNoStore) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url += `${separator}_cb=${Date.now()}`;
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'FirstRoom-NextJS/1.0',
    ...(cartToken ? { 'Cart-Token': cartToken } : {}),
    ...(nonce ? { 'Nonce': nonce } : {}),
    ...options?.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  if (!options?.cache && !options?.next) {
    fetchOptions.cache = 'no-store';
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const body = await response.text();
    let message = response.statusText;
    try {
      const parsed = JSON.parse(body);
      if (parsed.message) message = parsed.message;
    } catch { }
    throw new Error(`WooCommerce Store API Error: ${message} at ${endpoint}`);
  }

  const returnedCartToken = response.headers.get('Cart-Token') || cartToken || null;
  const returnedNonce = response.headers.get('Nonce') || nonce || null;
  const data = await response.json();

  return { data, cartToken: returnedCartToken, nonce: returnedNonce, headers: response.headers };
}

