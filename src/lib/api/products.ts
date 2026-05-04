import { fetchStoreApi, wcFetch } from "./client";
import { Product } from "@/types/product";
import { STORE_URL } from "./client";

function normalizeStoreProduct(raw: any): Product {
  const minorUnit = raw.prices?.currency_minor_unit || 2;
  const divisor = Math.pow(10, minorUnit);

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    shortDescription: raw.short_description,
    price: raw.prices?.price ? parseInt(raw.prices.price) / divisor : 0,
    regularPrice: raw.prices?.regular_price ? parseInt(raw.prices.regular_price) / divisor : 0,
    salePrice: raw.prices?.sale_price ? parseInt(raw.prices.sale_price) / divisor : undefined,
    images: raw.images?.map((img: any) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || raw.name,
    })) || [],
    categories: raw.categories || [],
    stockStatus: raw.is_in_stock ? "instock" : "outofstock",
    attributes: raw.attributes?.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      options: attr.terms ? attr.terms.map((t: any) => t.name) : []
    })) || [],
  };
}

export async function getProducts(options: { limit?: number } = {}): Promise<Product[]> {
  try {
    const limit = options.limit || 20;
    const { data } = await fetchStoreApi<any[]>(`products?per_page=${limit}`, null, {
      next: { revalidate: 3600, tags: ['products'] }
    });
    console.log("products:", data);
    return data.map(normalizeStoreProduct);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data } = await fetchStoreApi<any[]>(`products?slug=${slug}`, null, {
      next: { revalidate: 3600, tags: ['products', `product-${slug}`] }
    });
    if (!data || !data.length) return null;
    const rawData = data[0];
    const product = normalizeStoreProduct(rawData);

    // Fetch variations using wc/v3 API to get prices, as Store API doesn't include variation prices
    if (rawData.has_options && rawData.variations && rawData.variations.length > 0) {
      try {
        const variationsResponses = await Promise.all(
          rawData.variations.map((v: any) => wcFetch(`products/${product.id}/variations/${v.id}`, {
            next: { revalidate: 3600, tags: ['products', `product-${product.id}-variations`] }
          }))
        );

        const uniqueVariants = new Map<string, any>();

        variationsResponses.forEach(rawVar => {
          // Create a unique key based on all attributes
          const attrKey = (rawVar.attributes || [])
            .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))
            .map((attr: any) => `${attr.name}:${attr.option}`)
            .join('|');

          if (!uniqueVariants.has(attrKey)) {
            uniqueVariants.set(attrKey, {
              id: rawVar.id,
              attributes: rawVar.attributes ? rawVar.attributes.reduce((acc: any, attr: any) => {
                acc[attr.name] = attr.option;
                return acc;
              }, {}) : {},
              price: parseFloat(rawVar.price || "0"),
              regularPrice: parseFloat(rawVar.regular_price || "0"),
              salePrice: rawVar.sale_price ? parseFloat(rawVar.sale_price) : undefined,
              stockStatus: rawVar.in_stock ? "instock" : "outofstock",
              image: rawVar.image && rawVar.image.src ? { id: rawVar.image.id, src: rawVar.image.src, alt: rawVar.image.alt || '' } : undefined,
            });
          }
        });

        product.variants = Array.from(uniqueVariants.values());
      } catch (varError) {
        console.error(`Failed to fetch variations for product ${product.id}:`, varError);
      }
    }

    // Fetch Nameplate metadata
    const isNameplate = product.categories.some((c: any) => (c.slug || '').includes('nameplate') || (c.name || '').toLowerCase().includes('nameplate'));
    if (isNameplate) {
      try {
        const v3Product = await wcFetch(`products/${product.id}`, {
          next: { revalidate: 3600, tags: ['products', `product-${product.id}`] }
        });
        const metaData = v3Product.meta_data || [];
        const boxMeta = metaData.find((m: any) => m.key === '_np_box')?.value;
        const bgMeta = metaData.find((m: any) => m.key === '_np_bg')?.value;
        const textColorMeta = metaData.find((m: any) => m.key === '_np_text_color')?.value;

        if (boxMeta && bgMeta) {
          const [x, y, w, h] = boxMeta.split(',').map(Number);
          product.nameplateMeta = {
            box: { x, y, w, h },
            bg: bgMeta,
            textColor: textColorMeta === 'light' ? 'light' : 'dark',
          };
        }
      } catch (error) {
        console.error(`Failed to fetch nameplate meta for product ${product.id}:`, error);
      }
    }

    return product;
  } catch (error) {
    console.error(`Failed to fetch product ${slug}:`, error);
    return null;
  }
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  totalPages: number;
}

export async function getProductsByCategory(
  categoryId: string,
  page: number = 1,
  perPage: number = 20,
  orderby: string = 'date',
  order: string = 'desc'
): Promise<PaginatedProducts> {
  try {
    // Store API v1 orderby supports: date, id, include, name, parent, slug, title, menu_order
    // 'price' might not be supported in all environments/versions directly as orderby
    let sortParams = `&orderby=${orderby}&order=${order}`;

    // If it's price sorting, we keep it but ensure it's handled. 
    // If the API returns error for 'price', it will hit the catch block.
    // Use encoded category ID or slug
    const encodedCat = encodeURIComponent(categoryId);
    const { data, headers } = await fetchStoreApi<any[]>(
      `products?category=${encodedCat}&page=${page}&per_page=${perPage}${sortParams}`,
      null,
      { next: { revalidate: 3600, tags: ['products', `category-${categoryId}`] } }
    );
    console.log("products data:", data, "url:", STORE_URL?.endsWith('/') ? STORE_URL.slice(0, -1) : STORE_URL);

    const total = parseInt(headers.get('x-wp-total') || '0');
    const totalPages = parseInt(headers.get('x-wp-totalpages') || '0');

    return {
      products: Array.isArray(data) ? data.map(normalizeStoreProduct) : [],
      total,
      totalPages
    };
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error);
    // Fallback attempt without sorting if it failed
    try {
      const encodedCat = encodeURIComponent(categoryId);
      const { data, headers } = await fetchStoreApi<any[]>(
        `products?category=${encodedCat}&page=${page}&per_page=${perPage}`,
        null,
        { next: { revalidate: 3600, tags: ['products', `category-${categoryId}`] } }
      );
      const total = parseInt(headers.get('x-wp-total') || '0');
      const totalPages = parseInt(headers.get('x-wp-totalpages') || '0');
      return {
        products: Array.isArray(data) ? data.map(normalizeStoreProduct) : [],
        total,
        totalPages
      };
    } catch (e) {
      return { products: [], total: 0, totalPages: 0 };
    }
  }
}



