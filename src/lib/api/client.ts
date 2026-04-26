export const API_URL = process.env.NEXT_PUBLIC_WC_API_URL;
export const STORE_URL = process.env.NEXT_PUBLIC_WC_STORE_URL;

export async function wcFetch(endpoint: string) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    throw new Error("WooCommerce Store API error");
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
  options?: RequestInit,
  nonce?: string | null
): Promise<{ data: T; cartToken: string | null; nonce: string | null }> {
  const url = `${STORE_URL}/wp-json/wc/store/v1/${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(cartToken ? { 'Cart-Token': cartToken } : {}),
    ...(nonce ? { 'Nonce': nonce } : {}),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: 'no-store',
  });

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

  return { data, cartToken: returnedCartToken, nonce: returnedNonce };
}
