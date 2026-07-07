import { shopifyFetch } from '../shopify';
import { Product } from '@/types/product';

function parseGid(gid: string): number {
  const matches = gid.match(/\/(\d+)$/);
  return matches ? parseInt(matches[1], 10) : 0;
}

function normalizeShopifyProduct(node: any): Product {
  const minPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
  
  // Extract metafields
  const boxMeta = node.metafields?.find((m: any) => m && m.key === 'np_box')?.value;
  const bgMeta = node.metafields?.find((m: any) => m && m.key === 'np_bg')?.value;
  const textColorMeta = node.metafields?.find((m: any) => m && m.key === 'np_text_color')?.value;

  let nameplateMeta;
  if (boxMeta && bgMeta) {
    const coords = boxMeta.split(',').map((val: string) => Number(val.trim()));
    if (coords.length === 4 && !coords.some(Number.isNaN)) {
      nameplateMeta = {
        box: { x: coords[0], y: coords[1], w: coords[2], h: coords[3] },
        bg: bgMeta,
        textColor: textColorMeta === 'light' ? ('light' as const) : ('dark' as const),
      };
    }
  }

  const images = (node.images?.edges || []).map((edge: any) => ({
    id: parseGid(edge.node.id),
    src: edge.node.url,
    alt: edge.node.altText || node.title,
  }));

  const categories = (node.collections?.edges || []).map((edge: any) => ({
    id: parseGid(edge.node.id),
    name: edge.node.title,
    slug: edge.node.handle,
  }));

  const variants = (node.variants?.edges || []).map((edge: any) => {
    const vNode = edge.node;
    const attrs: Record<string, string> = {};
    (vNode.selectedOptions || []).forEach((opt: any) => {
      // Map attribute name to pa_ prefix for WooCommerce compatibility in UI components
      const attrName = `pa_${opt.name.toLowerCase().replace(/\s+/g, '-')}`;
      attrs[attrName] = opt.value;
    });

    return {
      id: parseGid(vNode.id),
      attributes: attrs,
      price: parseFloat(vNode.price?.amount || '0'),
      regularPrice: parseFloat(vNode.compareAtPrice?.amount || vNode.price?.amount || '0'),
      salePrice: vNode.compareAtPrice ? parseFloat(vNode.price?.amount) : undefined,
      stockStatus: vNode.availableForSale ? ('instock' as const) : ('outofstock' as const),
      image: vNode.image ? {
        id: parseGid(vNode.image.id),
        src: vNode.image.url,
        alt: vNode.image.altText || vNode.title,
      } : undefined,
    };
  });

  const attributes = (node.options || []).map((opt: any) => ({
    id: parseGid(opt.id || '0'),
    name: `pa_${opt.name.toLowerCase().replace(/\s+/g, '-')}`,
    options: opt.values || [],
  }));

  const stockStatus = node.availableForSale ? ('instock' as const) : ('outofstock' as const);

  return {
    id: parseGid(node.id),
    name: node.title,
    slug: node.handle,
    description: node.description || '',
    shortDescription: node.descriptionHtml || '',
    price: minPrice,
    regularPrice: minPrice,
    images,
    categories,
    variants,
    stockStatus,
    attributes,
    nameplateMeta,
  };
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          collections(first: 5) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProducts(options: { limit?: number } = {}): Promise<Product[]> {
  try {
    const limit = options.limit || 20;
    const { body } = await shopifyFetch<{ products: { edges: any[] } }>({
      query: PRODUCTS_QUERY,
      variables: { first: limit },
      revalidate: 3600,
      tags: ['products'],
    });

    return (body.products?.edges || []).map((edge) => normalizeShopifyProduct(edge.node));
  } catch (error) {
    console.error('Failed to fetch products from Shopify:', error);
    return [];
  }
}

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      collections(first: 5) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
            image {
              id
              url
              altText
            }
          }
        }
      }
      options {
        id
        name
        values
      }
      metafields(identifiers: [
        { namespace: "custom", key: "np_box" },
        { namespace: "custom", key: "np_bg" },
        { namespace: "custom", key: "np_text_color" }
      ]) {
        id
        namespace
        key
        value
      }
    }
  }
`;

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { body } = await shopifyFetch<{ product: any }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle: slug },
      revalidate: 3600,
      tags: ['products', `product-${slug}`],
    });

    if (!body.product) return null;
    return normalizeShopifyProduct(body.product);
  } catch (error) {
    console.error(`Failed to fetch product ${slug} from Shopify:`, error);
    return null;
  }
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  totalPages: number;
}

const PRODUCTS_BY_COLLECTION_QUERY = `
  query GetCollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductsByCategory(
  categoryId: string,
  page: number = 1,
  perPage: number = 20,
  orderby: string = 'date',
  order: string = 'desc'
): Promise<PaginatedProducts> {
  // orderby and order are WooCommerce specific, we can ignore or adapt if Shopify supports sort keys in future.
  void page;
  void orderby;
  void order;

  try {
    const { body } = await shopifyFetch<{ collection: { products: { edges: any[] } } }>({
      query: PRODUCTS_BY_COLLECTION_QUERY,
      variables: { handle: categoryId, first: perPage },
      revalidate: 3600,
      tags: ['products', `category-${categoryId}`],
    });

    if (!body.collection) {
      return { products: [], total: 0, totalPages: 0 };
    }

    const products = (body.collection.products?.edges || []).map((edge) => normalizeShopifyProduct(edge.node));

    return {
      products,
      total: products.length,
      totalPages: 1,
    };
  } catch (error) {
    console.error(`Failed to fetch collection products for category ${categoryId} from Shopify:`, error);
    return { products: [], total: 0, totalPages: 0 };
  }
}
