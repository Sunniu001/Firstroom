import { NextRequest, NextResponse } from 'next/server';

const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

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
      // Surface the WC error message cleanly
      const message = data?.message?.replace(/<[^>]+>/g, '') || 'Registration failed.';
      return NextResponse.json({ message }, { status: res.status });
    }

    return NextResponse.json({ id: data.id, email: data.email });
  } catch (err: any) {
    console.error('[register] Error:', err);
    return NextResponse.json({ message: 'Server error. Please try again.' }, { status: 500 });
  }
}
