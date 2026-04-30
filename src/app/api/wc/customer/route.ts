import { NextRequest, NextResponse } from 'next/server';

const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

function basicAuth() {
  return 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
}

// GET /api/wc/customer?email=xxx — look up customer by email
// GET /api/wc/customer?id=xxx  — get customer by ID
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get('email');
  const id = searchParams.get('id');

  try {
    let url: string;
    if (id) {
      url = `${WC_API}/customers/${id}`;
    } else if (email) {
      url = `${WC_API}/customers?email=${encodeURIComponent(email)}&role=all`;
    } else {
      return NextResponse.json({ message: 'email or id required' }, { status: 400 });
    }

    const res = await fetch(url, { headers: { Authorization: basicAuth() } });
    const data = await res.json();

    if (!res.ok) return NextResponse.json({ message: data?.message || 'Not found' }, { status: res.status });

    const customer = id ? data : (Array.isArray(data) ? data[0] : null);
    if (!customer) return NextResponse.json({ message: 'Customer not found' }, { status: 404 });

    return NextResponse.json(customer);
  } catch (err) {
    console.error('[customer GET]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/wc/customer?id=xxx — update customer
export async function PUT(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id required' }, { status: 400 });

  try {
    const payload = await req.json();
    const res = await fetch(`${WC_API}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: basicAuth() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ message: data?.message || 'Update failed' }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[customer PUT]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
