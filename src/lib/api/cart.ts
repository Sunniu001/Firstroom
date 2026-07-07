'use server';

import { shopifyFetch } from '../shopify';
import { NormalizedCart, NormalizedCartItem } from '@/types/product';

function parseGid(gid: string): number {
  const matches = gid.match(/\/(\d+)$/);
  return matches ? parseInt(matches[1], 10) : 0;
}

function toProductGid(id: string | number): string {
  if (typeof id === 'string' && id.startsWith('gid://')) return id;
  return `gid://shopify/Product/${id}`;
}

function toVariantGid(id: string | number): string {
  if (typeof id === 'string' && id.startsWith('gid://')) return id;
  return `gid://shopify/ProductVariant/${id}`;
}

async function getFirstVariantId(productId: string): Promise<string> {
  const gid = toProductGid(productId);
  const { body } = await shopifyFetch<{ node: { variants?: { edges?: any[] } } }>({
    query: `
      query GetProductVariants($id: ID!) {
        node(id: $id) {
          ... on Product {
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `,
    variables: { id: gid },
  });

  const variantId = body.node?.variants?.edges?.[0]?.node?.id;
  if (!variantId) {
    throw new Error(`Could not find any variants for product ID ${productId}`);
  }
  return variantId;
}

function normalizeCart(shopifyCart: any): NormalizedCart {
  return {
    id: shopifyCart.id,
    totalQuantity: shopifyCart.totalQuantity || 0,
    items: (shopifyCart.lines?.edges || []).map((edge: any) => {
      const line = edge.node;
      const variant = line.merchandise;
      const product = variant.product;
      const img = variant.image?.url || product.images?.edges?.[0]?.node?.url || '';

      const customData: Record<string, string> = {};
      (line.attributes || []).forEach((attr: any) => {
        customData[attr.key] = attr.value;
      });

      const isWallpaper =
        customData['Area'] !== undefined ||
        product.title.toLowerCase().includes('wallpaper') ||
        variant.sku?.startsWith('FMWPAR');

      return {
        id: line.id,
        productId: String(parseGid(product.id)),
        variationId: parseGid(variant.id),
        quantity: line.quantity,
        title: product.title,
        image: img,
        sku: variant.sku || '',
        isWallpaper,
        price: {
          amount: variant.price?.amount || '0',
          currencyCode: variant.price?.currencyCode || 'INR',
        },
        customData: Object.keys(customData).length > 0 ? customData : undefined,
      };
    }),
    cost: {
      subtotalAmount: {
        amount: shopifyCart.cost?.subtotalAmount?.amount || '0',
        currencyCode: shopifyCart.cost?.subtotalAmount?.currencyCode || 'INR',
      },
      totalAmount: {
        amount: shopifyCart.cost?.totalAmount?.amount || '0',
        currencyCode: shopifyCart.cost?.totalAmount?.currencyCode || 'INR',
      },
    },
  };
}

export async function getCart(cartToken: string | null): Promise<NormalizedCart | null> {
  if (!cartToken) return null;

  try {
    const { body } = await shopifyFetch<{ cart: any }>({
      query: `
        query GetCart($id: ID!) {
          cart(id: $id) {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      sku
                      product {
                        id
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                }
              }
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      `,
      variables: { id: cartToken },
    });

    if (!body.cart) return null;
    return normalizeCart(body.cart);
  } catch (error) {
    console.error('Error fetching cart from Shopify:', error);
    return null;
  }
}

export async function addToCart(
  cartToken: string | null,
  productId: string,
  quantity: number = 1,
  variation?: Array<{ attribute: string; value: string }>,
  customData?: Record<string, string>
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  void variation; // variation resolution handled via _variation_id in customData or first variant search

  let variantId = '';
  if (customData?._variation_id) {
    variantId = toVariantGid(customData._variation_id);
  } else {
    variantId = await getFirstVariantId(productId);
  }

  const customAttributes: Array<{ key: string; value: string }> = [];
  if (customData) {
    Object.entries(customData).forEach(([key, value]) => {
      if (!key.startsWith('_')) {
        customAttributes.push({ key, value });
      }
    });
  }

  if (!cartToken) {
    const { body } = await shopifyFetch<{ cartCreate: { cart: any } }>({
      query: `
        mutation CartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              id
              checkoutUrl
              totalQuantity
              lines(first: 100) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        title
                        price {
                          amount
                          currencyCode
                        }
                        sku
                        product {
                          id
                          title
                          handle
                          images(first: 1) {
                            edges {
                              node {
                                url
                                altText
                              }
                            }
                          }
                        }
                      }
                    }
                    attributes {
                      key
                      value
                    }
                  }
                }
              }
              cost {
                subtotalAmount {
                  amount
                  currencyCode
                }
                totalAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          lines: [
            {
              merchandiseId: variantId,
              quantity,
              attributes: customAttributes,
            },
          ],
        },
      },
    });

    const newCart = body.cartCreate?.cart;
    if (!newCart) {
      throw new Error('Failed to create cart on Shopify.');
    }

    return {
      cart: normalizeCart(newCart),
      cartToken: newCart.id,
    };
  }

  const { body } = await shopifyFetch<{ cartLinesAdd: { cart: any } }>({
    query: `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      sku
                      product {
                        id
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                }
              }
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `,
    variables: {
      cartId: cartToken,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
          attributes: customAttributes,
        },
      ],
    },
  });

  const updatedCart = body.cartLinesAdd?.cart;
  if (!updatedCart) {
    throw new Error('Failed to add line item to Shopify cart.');
  }

  return {
    cart: normalizeCart(updatedCart),
    cartToken: updatedCart.id,
  };
}

export async function updateCartItem(
  cartToken: string,
  itemKey: string,
  quantity: number
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  const { body } = await shopifyFetch<{ cartLinesUpdate: { cart: any } }>({
    query: `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      sku
                      product {
                        id
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                }
              }
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `,
    variables: {
      cartId: cartToken,
      lines: [
        {
          id: itemKey,
          quantity,
        },
      ],
    },
  });

  const updatedCart = body.cartLinesUpdate?.cart;
  if (!updatedCart) {
    throw new Error('Failed to update line item in Shopify cart.');
  }

  return {
    cart: normalizeCart(updatedCart),
    cartToken: updatedCart.id,
  };
}

export async function removeCartItem(
  cartToken: string,
  itemKey: string
): Promise<{ cart: NormalizedCart; cartToken: string }> {
  const { body } = await shopifyFetch<{ cartLinesRemove: { cart: any } }>({
    query: `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      sku
                      product {
                        id
                        title
                        handle
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                  }
                  attributes {
                    key
                    value
                  }
                }
              }
            }
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `,
    variables: {
      cartId: cartToken,
      lineIds: [itemKey],
    },
  });

  const updatedCart = body.cartLinesRemove?.cart;
  if (!updatedCart) {
    throw new Error('Failed to remove line item from Shopify cart.');
  }

  return {
    cart: normalizeCart(updatedCart),
    cartToken: updatedCart.id,
  };
}

export interface BillingDetails {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  account_email?: string;
  password?: string;
}

export interface CheckoutResult {
  orderId: number;
  orderKey: string;
  paymentRedirectUrl: string | null;
  status: string;
  cartCleanup?: {
    removedItemKeys: string[];
    failedItemKeys: string[];
  };
}

export async function placeOrder(
  cartToken: string,
  billing: BillingDetails,
  selectedItemKeys: string[],
  allItems: Array<{
    id: string;
    productId: string;
    variationId?: number;
    title: string;
    quantity: number;
    customData?: Record<string, string>;
  }>,
  paymentMethod: string = 'razorpay',
  authToken?: string
): Promise<CheckoutResult> {
  void cartToken;
  void billing;
  void selectedItemKeys;
  void allItems;
  void paymentMethod;
  void authToken;
  throw new Error('Use placeOrderClient from src/lib/api/checkoutClient for browser-origin checkout calls.');
}
