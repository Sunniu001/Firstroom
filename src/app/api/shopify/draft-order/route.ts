import { NextRequest, NextResponse } from 'next/server';

// Allow cross-origin calls from the Shopify storefront
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export interface WallpaperOrderItem {
  variant_id: number;
  height: number;
  width: number;
  area: number;
  price_per_sqft: number; // in rupees (not paise)
  product_title: string;
  material?: string;
}

export interface DraftOrderPayload {
  items: WallpaperOrderItem[];
}

function buildLineItem(item: WallpaperOrderItem) {
  const totalPrice = (item.area * item.price_per_sqft).toFixed(2);
  const properties: { name: string; value: string }[] = [
    { name: 'Height (ft)', value: item.height.toFixed(1) },
    { name: 'Width (ft)', value: item.width.toFixed(1) },
    { name: 'Area (sq.ft)', value: String(item.area) },
  ];
  if (item.material) {
    properties.push({ name: 'Material', value: item.material });
  }

  return {
    variant_id: item.variant_id,
    quantity: 1,
    price: totalPrice,
    title: item.product_title,
    properties,
    applied_discount: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DraftOrderPayload;
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Validate required fields
    for (const item of items) {
      if (!item.variant_id || !item.area || !item.price_per_sqft) {
        return NextResponse.json(
          { error: 'Each item needs variant_id, area, and price_per_sqft.' },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

    if (!shopDomain || !adminToken) {
      console.error('[draft-order] Missing Shopify credentials in env');
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const lineItems = items.map(buildLineItem);

    const draftOrderPayload = {
      draft_order: {
        line_items: lineItems,
        use_customer_default_address: false,
        // AreaPro tag so we can identify these orders
        tags: 'areapro,wallpaper',
        note: `Created by AreaPro — Custom Dimension Pricing`,
      },
    };

    const shopifyRes = await fetch(
      `https://${shopDomain}/admin/api/${apiVersion}/draft_orders.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
        body: JSON.stringify(draftOrderPayload),
      }
    );

    const shopifyData = await shopifyRes.json();

    if (!shopifyRes.ok) {
      console.error('[draft-order] Shopify error:', shopifyData);
      return NextResponse.json(
        { error: shopifyData.errors || 'Failed to create draft order.' },
        { status: shopifyRes.status, headers: CORS_HEADERS }
      );
    }

    const { draft_order } = shopifyData;

    return NextResponse.json(
      {
        draft_order_id: draft_order.id,
        checkout_url: draft_order.invoice_url,
        status: draft_order.status,
      },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('[draft-order POST]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
