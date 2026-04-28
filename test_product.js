const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/tmp/product.json'));

function normalizeStoreProduct(raw) {
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
    images: raw.images?.map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || raw.name,
    })) || [],
    categories: raw.categories || [],
    stockStatus: raw.is_in_stock ? "instock" : "outofstock",
    attributes: raw.attributes?.map((attr) => ({
      id: attr.id,
      name: attr.name,
      options: attr.terms ? attr.terms.map((t) => t.name) : []
    })) || [],
  };
}

const product = normalizeStoreProduct(data[0]);

const isNameplate = product.categories.some((c) => (c.slug || '').includes('nameplate') || (c.name || '').toLowerCase().includes('nameplate'));

function mapToLegacyProduct(product) {
  return {
    id: (product.id || '').toString(),
    handle: product.slug,
    title: product.name,
    description: product.description,
    descriptionHtml: product.description,
    price: {
      amount: product.price.toString(),
      currencyCode: 'INR',
    },
    availableForSale: product.stockStatus === 'instock',
    images: product.images.map(img => ({ url: img.src, altText: img.alt })),
    categories: product.categories.map(c => c.name),
    isWallpaper: product.categories.some(c => (c.slug || '').includes('wallpaper') || (c.name || '').toLowerCase().includes('wallpaper')),
    isNameplate: product.categories.some(c => (c.slug || '').includes('nameplate') || (c.name || '').toLowerCase().includes('nameplate')),
    nameplateMeta: product.nameplateMeta,
    attributes: product.attributes,
    variants: product.variants,
  };
}

const legacyProduct = mapToLegacyProduct(product);
console.log(JSON.stringify(legacyProduct, null, 2));
