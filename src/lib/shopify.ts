const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-04';

export async function shopifyFetch<T>({
  query,
  variables = {},
  headers = {},
  cache = 'no-store',
  tags = [],
  revalidate,
}: {
  query: string;
  variables?: Record<string, any>;
  headers?: HeadersInit;
  cache?: RequestCache;
  tags?: string[];
  revalidate?: number;
}): Promise<{ status: number; body: T }> {
  if (!domain || !accessToken) {
    throw new Error('Shopify domain or Storefront access token is missing in environment variables.');
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': accessToken,
      ...headers,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  };

  if (cache === 'force-cache') {
    fetchOptions.cache = 'force-cache';
  } else if (cache === 'no-store') {
    fetchOptions.cache = 'no-store';
  }

  // Next.js specific revalidation options if present
  if (revalidate !== undefined) {
    (fetchOptions as any).next = { revalidate, tags };
  } else if (tags.length > 0) {
    (fetchOptions as any).next = { tags };
  }

  try {
    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Shopify API HTTP error: ${response.status} ${response.statusText}. Response: ${text}`);
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    return {
      status: response.status,
      body: json.data as T,
    };
  } catch (error) {
    console.error('Error during Shopify Fetch:', error);
    throw error;
  }
}
