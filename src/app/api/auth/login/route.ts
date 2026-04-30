import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://sunniy.com';
const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Step 1: Get JWT token from WordPress
    const jwtRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });
    const jwtData = await jwtRes.json();
    if (!jwtRes.ok) {
      const message = jwtData?.message?.replace(/<[^>]+>/g, '') || 'Invalid email or password.';
      return NextResponse.json({ message }, { status: 401 });
    }

    // Step 2: Look up WooCommerce customer by email (needs server-side Basic Auth)
    const basicAuth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
    const custRes = await fetch(
      `${WC_API}/customers?email=${encodeURIComponent(email)}&role=all`,
      { headers: { Authorization: `Basic ${basicAuth}` } }
    );
    const custData = await custRes.json();

    // Some WP users exist but don't have a WC customer record yet — that's fine
    const customer = Array.isArray(custData) && custData[0] ? custData[0] : null;

    return NextResponse.json({
      token: jwtData.token,
      user_email: jwtData.user_email,
      user_display_name: jwtData.user_display_name,
      id: customer?.id ?? 0,
      first_name: customer?.first_name ?? jwtData.user_display_name ?? '',
      last_name: customer?.last_name ?? '',
    });
  } catch (err: any) {
    console.error('[login] Error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
