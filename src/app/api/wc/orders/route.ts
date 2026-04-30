import { NextRequest, NextResponse } from 'next/server';

const WC_API = process.env.NEXT_PUBLIC_WC_API_URL || 'https://sunniy.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

function basicAuth() {
  return 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
}

// GET /api/wc/orders?customer_id=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const customerId = searchParams.get('customer_id');
  const orderId = searchParams.get('id');

  if (!customerId && !orderId) {
    return NextResponse.json({ message: 'customer_id or id required' }, { status: 400 });
  }

  try {
    const url = orderId 
      ? `${WC_API}/orders/${orderId}`
      : `${WC_API}/orders?customer=${customerId}&per_page=20&orderby=date&order=desc`;
      
    const res = await fetch(
      url,
      { headers: { Authorization: basicAuth() } }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ message: data?.message || 'Error fetching orders' }, { status: res.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[orders GET]', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
