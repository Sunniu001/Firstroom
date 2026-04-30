const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://sunniy.com';
const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

export interface LoginResult {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
}

export interface WCOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  currency_symbol: string;
  line_items: Array<{ name: string; quantity: number; total: string; image?: { src: string } }>;
}

// ─── AUTH ────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message?.replace(/<[^>]+>/g, '') || 'Login failed');
  }
  return data;
}

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<{ id: number; email: string }> {
  // Use WC REST API to create customer (doesn't need JWT yet)
  const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const res = await fetch(`${WC_API}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      username: email,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || 'Registration failed');
  }
  return { id: data.id, email: data.email };
}

// ─── CUSTOMER ────────────────────────────────────────────────────

function wcAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getCustomerByEmail(token: string, email: string): Promise<WCCustomer> {
  const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const res = await fetch(`${WC_API}/customers?email=${encodeURIComponent(email)}&role=all`, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });
  const data = await res.json();
  if (!res.ok || !data[0]) throw new Error('Customer not found');
  return data[0];
}

export async function updateCustomer(
  customerId: number,
  payload: Partial<WCCustomer>
): Promise<WCCustomer> {
  const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const res = await fetch(`${WC_API}/customers/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Update failed');
  return data;
}

export async function getCustomerOrders(customerId: number): Promise<WCOrder[]> {
  const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const res = await fetch(`${WC_API}/orders?customer=${customerId}&per_page=20`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Could not fetch orders');
  return data;
}
