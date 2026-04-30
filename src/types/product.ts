export type ProductImage = {
  id: number;
  src: string;
  alt: string;
};

export type ProductVariant = {
  id: number;
  attributes: Record<string, string>;
  price: number;
  regularPrice: number;
  salePrice?: number;
  stockStatus: "instock" | "outofstock";
  image?: ProductImage;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  regularPrice: number;
  salePrice?: number;
  images: ProductImage[];
  categories: { id: number; name: string; slug: string }[];
  variants?: ProductVariant[];
  stockStatus: "instock" | "outofstock";
  attributes?: { id: number; name: string; options: string[] }[];
  nameplateMeta?: {
    box: { x: number; y: number; w: number; h: number };
    bg: string;
    textColor: 'dark' | 'light';
  };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  image?: string;
};

// Legacy/Component Types to ensure components don't break during refactor
export interface NormalizedProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  images: { url: string; altText: string }[];
  categories: string[];
  isWallpaper?: boolean;
  isNameplate?: boolean;
  nameplateMeta?: {
    box: { x: number; y: number; w: number; h: number };
    bg: string;
    textColor: 'dark' | 'light';
  };
  attributes?: { name: string; options: string[] }[];
  variants?: ProductVariant[];
}

export interface NormalizedCartItem {
  id: string; // The cart item key
  productId: string;
  quantity: number;
  title: string;
  image: string;
  sku?: string;
  isWallpaper?: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  customData?: Record<string, string>;
}

export interface NormalizedCart {
  id: string; // cart token
  items: NormalizedCartItem[];
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
}

// Store API Types
export interface StoreCartItem {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  images: { id: number; src: string; alt: string }[];
  item_data?: Array<{ key: string; value: string }>;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
    raw_prices: {
      precision: number;
      price: string;
      regular_price: string;
      sale_price: string;
    };
  };
  totals: {
    line_subtotal: string;
    line_total: string;
  };
}

export interface StoreCart {
  cart_token: string;
  items: StoreCartItem[];
  items_count: number;
  items_weight: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  totals: {
    total_items: string;
    total_items_tax: string;
    total_fees: string;
    total_fees_tax: string;
    total_discount: string;
    total_discount_tax: string;
    total_shipping: string;
    total_shipping_tax: string;
    total_price: string;
    total_tax: string;
    tax_lines: Array<any>;
    currency_code: string;
    currency_symbol: string;
    currency_minor_unit: number;
  };
}
