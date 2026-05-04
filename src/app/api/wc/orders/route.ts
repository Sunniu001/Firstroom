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
  const email = searchParams.get('email');
  const orderId = searchParams.get('id');

  if (!customerId && !orderId && !email) {
    return NextResponse.json({ message: 'customer_id, email or id required' }, { status: 400 });
  }

  try {
    let url = '';
    if (orderId) {
      url = `${WC_API}/orders/${orderId}`;
    } else if (email || customerId) {
      // Fetch by both ID and Email to catch everything (Guest + Registered)
      const requests = [];
      if (customerId) requests.push(fetch(`${WC_API}/orders?customer=${customerId}&per_page=50`, { headers: { Authorization: basicAuth() } }));
      if (email) requests.push(fetch(`${WC_API}/orders?billing_email=${encodeURIComponent(email)}&per_page=50`, { headers: { Authorization: basicAuth() } }));
      
      const responses = await Promise.all(requests);
      const datasets = await Promise.all(responses.map(r => r.json()));
      
      // Flatten only the results that are valid arrays
      const merged = datasets.filter(d => Array.isArray(d)).flat();
      
      // Merge and remove duplicates by order ID
      const unique = Array.from(new Map(merged.map(o => [o.id, o])).values())
        .sort((a: any, b: any) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
        
      return NextResponse.json(unique);
    }
      
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
