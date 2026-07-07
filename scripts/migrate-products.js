// scripts/migrate-products.js
const fs = require('fs');
const path = require('path');

// Helper to load env variables manually from .env.local
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('No .env.local file found.');
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();

// API Configuration
const WC_KEY = env['WC_CONSUMER_KEY'] || 'ck_364949c20cf7f981961b6f4a708b9034aa7b24f9';
const WC_SECRET = env['WC_CONSUMER_SECRET'] || 'cs_042042bf375c5e662ab6b4dbd669caafa3572f78';
const WC_BASE_URL = 'https://sunniy.com/wp-json/wc/v3';

const SHOPIFY_DOMAIN = env['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'] || 'em8r1e-kv.myshopify.com';
const SHOPIFY_TOKEN = env['SHOPIFY_ADMIN_ACCESS_TOKEN'] || '';
const SHOPIFY_VERSION = env['SHOPIFY_API_VERSION'] || '2024-04';

// Helper to fetch from WooCommerce
async function fetchWoo(endpoint) {
  const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');
  const url = `${WC_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`WooCommerce API Error (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

// Helper to POST to Shopify (REST API)
async function postShopify(endpoint, body) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) {
    return { success: false, status: response.status, errors: data.errors || response.statusText };
  }
  return { success: true, data };
}

// Delay helper for rate limiting (respecting Shopify bucket rate limits)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Normalizes WooCommerce product payload to Shopify product schema
function mapProduct(wooProduct, wooVariations = []) {
  const isWallpaper = wooProduct.categories.some(c => 
    (c.slug || '').includes('wallpaper') || (c.name || '').toLowerCase().includes('wallpaper')
  );
  
  const isNameplate = wooProduct.categories.some(c => 
    (c.slug || '').includes('nameplate') || (c.name || '').toLowerCase().includes('nameplate')
  );

  const tagsList = ['WooCommerce-Import'];
  wooProduct.categories.forEach(c => tagsList.push(c.name));
  
  let productType = 'Home Decor';
  if (isWallpaper) {
    productType = 'Wallpaper';
    tagsList.push('wallpaper');
  } else if (isNameplate) {
    productType = 'Nameplate';
    tagsList.push('nameplate');
  }

  const shopifyImages = wooProduct.images.map(img => ({
    src: img.src,
    alt: img.alt || wooProduct.name
  }));

  const metafields = [];
  const metaMap = {};
  wooProduct.meta_data.forEach(m => {
    metaMap[m.key] = m.value;
  });

  if (isNameplate) {
    if (metaMap['_np_box']) {
      metafields.push({
        namespace: 'custom',
        key: 'np_box',
        value: metaMap['_np_box'],
        type: 'single_line_text_field'
      });
    }
    if (metaMap['_np_bg']) {
      metafields.push({
        namespace: 'custom',
        key: 'np_bg',
        value: metaMap['_np_bg'],
        type: 'url'
      });
    }
    if (metaMap['_np_text_color']) {
      metafields.push({
        namespace: 'custom',
        key: 'np_text_color',
        value: metaMap['_np_text_color'],
        type: 'single_line_text_field'
      });
    }
  }

  let options = [];
  let variants = [];

  if (isWallpaper) {
    const materialAttr = wooProduct.attributes.find(a => (a.name || '').toLowerCase() === 'material');
    const materialOptions = materialAttr ? materialAttr.options : ['Leather Finish', 'Velvet', 'Canvas'];
    
    options = [
      {
        name: 'Material',
        values: materialOptions
      }
    ];

    variants = materialOptions.map((opt, index) => ({
      option1: opt,
      price: wooProduct.price || '180.00',
      sku: `${wooProduct.sku || 'FRWP'}-${index + 1}`,
      requires_shipping: true,
      taxable: true,
      inventory_policy: 'continue',
      inventory_management: null
    }));

  } else if (wooProduct.type === 'variable' && wooVariations.length > 0) {
    options = wooProduct.attributes.map(attr => ({
      name: attr.name,
      values: attr.options
    }));

    variants = wooVariations.map(variation => {
      const opt1 = variation.attributes[0]?.option || null;
      const opt2 = variation.attributes[1]?.option || null;
      const opt3 = variation.attributes[2]?.option || null;

      return {
        option1: opt1,
        option2: opt2,
        option3: opt3,
        price: variation.price,
        sku: variation.sku || `${wooProduct.sku || 'FRNP'}-${variation.id}`,
        requires_shipping: true,
        taxable: true,
        inventory_policy: variation.manage_stock && variation.stock_status !== 'instock' ? 'deny' : 'continue',
        inventory_management: variation.manage_stock ? 'shopify' : null
      };
    });
  } else {
    variants = [{
      price: wooProduct.price || '0.00',
      sku: wooProduct.sku || `FR-SIMPLE-${wooProduct.id}`,
      requires_shipping: true,
      taxable: true,
      inventory_policy: wooProduct.stock_status === 'instock' ? 'continue' : 'deny'
    }];
  }

  return {
    handle: wooProduct.slug,
    title: wooProduct.name,
    body_html: wooProduct.description || wooProduct.short_description || '',
    vendor: 'Firstroom',
    product_type: productType,
    status: 'active',
    tags: tagsList.join(', '),
    images: shopifyImages,
    options: options,
    variants: variants,
    metafields: metafields
  };
}

function deduplicateVariants(product) {
  if (!product.variants || product.variants.length <= 1) return product;

  const seen = new Set();
  const dedupedVariants = [];

  product.variants.forEach(v => {
    const key = [v.option1, v.option2, v.option3].filter(Boolean).join('|||');
    if (!seen.has(key)) {
      seen.add(key);
      dedupedVariants.push(v);
    }
  });

  const newOptions = (product.options || []).map((opt, idx) => {
    const optKey = `option${idx + 1}`;
    const uniqueValues = [...new Set(dedupedVariants.map(v => v[optKey]).filter(Boolean))];
    return { ...opt, values: uniqueValues.length > 0 ? uniqueValues : ['Default Title'] };
  });

  return {
    ...product,
    variants: dedupedVariants,
    options: newOptions
  };
}

// Convert products to Shopify-compatible CSV string
function convertToCSV(products) {
  const headers = [
    'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published',
    'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
    'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
    'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
    'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card', 'Status'
  ];
  
  const rows = [headers.join(',')];

  function escapeCSV(val) {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }
    return str;
  }

  for (const p of products) {
    const maxRows = Math.max(p.variants.length, p.images.length);
    for (let i = 0; i < maxRows; i++) {
      const variant = p.variants[i] || {};
      const image = p.images[i] || {};
      
      const option1Name = p.options[0]?.name || '';
      const option1Value = variant.option1 || '';
      const option2Name = p.options[1]?.name || '';
      const option2Value = variant.option2 || '';
      const option3Name = p.options[2]?.name || '';
      const option3Value = variant.option3 || '';

      const csvFields = [
        escapeCSV(i === 0 ? p.handle : ''),
        escapeCSV(i === 0 ? p.title : ''),
        escapeCSV(i === 0 ? p.body_html : ''),
        escapeCSV(i === 0 ? p.vendor : ''),
        escapeCSV(i === 0 ? p.product_type : ''),
        escapeCSV(i === 0 ? p.tags : ''),
        'true', // Published
        escapeCSV(option1Name),
        escapeCSV(option1Value),
        escapeCSV(option2Name),
        escapeCSV(option2Value),
        escapeCSV(option3Name),
        escapeCSV(option3Value),
        escapeCSV(variant.sku || ''),
        '0', // Variant Grams
        escapeCSV(variant.inventory_management || ''),
        '',  // Variant Inventory Qty
        escapeCSV(variant.inventory_policy || 'continue'),
        'manual', // Variant Fulfillment Service
        escapeCSV(variant.price || ''),
        '', // Variant Compare At Price
        variant.requires_shipping !== undefined ? String(variant.requires_shipping) : 'true',
        variant.taxable !== undefined ? String(variant.taxable) : 'true',
        '', // Variant Barcode
        escapeCSV(image.src || ''),
        image.src ? String(i + 1) : '',
        escapeCSV(image.alt || ''),
        'false', // Gift Card
        escapeCSV(i === 0 ? p.status : '')
      ];
      rows.push(csvFields.join(','));
    }
  }
  return rows.join('\n');
}

async function runMigration() {
  console.log('=== Starting Firstroom WooCommerce -> Shopify Product Migration ===');
  
  const scratchDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir);
  }

  const allShopifyProducts = [];
  let page = 1;
  const limit = 50;
  let keepFetching = true;

  try {
    // 1. Fetch products page by page from WooCommerce
    while (keepFetching) {
      console.log(`\nFetching WooCommerce products page ${page} (limit ${limit})...`);
      const rawProducts = await fetchWoo(`products?per_page=${limit}&page=${page}`);
      
      if (!rawProducts || rawProducts.length === 0) {
        console.log('No more products found from WooCommerce.');
        keepFetching = false;
        break;
      }

      console.log(`Retrieved ${rawProducts.length} raw products. Mapping...`);

      for (const rawProduct of rawProducts) {
        let variations = [];
        
        // If variable product, fetch all variation options
        if (rawProduct.type === 'variable') {
          try {
            console.log(` -> Variable product found: "${rawProduct.name}" (ID ${rawProduct.id}). Fetching variations...`);
            variations = await fetchWoo(`products/${rawProduct.id}/variations?per_page=100`);
            console.log(`    Retrieved ${variations.length} variations.`);
          } catch (e) {
            console.error(`    Error fetching variations for product ID ${rawProduct.id}:`, e.message);
          }
        }

        let mapped = mapProduct(rawProduct, variations);
        mapped = deduplicateVariants(mapped);
        allShopifyProducts.push(mapped);
      }

      page++;
      // Safety limit to prevent infinite loops in bad response scenarios
      if (page > 15) {
        keepFetching = false;
      }
    }

    console.log(`\nAll products fetched. Mapped a total of ${allShopifyProducts.length} products.`);

    // 2. Write products mapped to JSON file
    const jsonPath = path.join(scratchDir, 'all-shopify-products.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allShopifyProducts, null, 2));
    console.log(`JSON payload saved to: ${jsonPath}`);

    // 3. Write Shopify-compatible CSV file
    const csvPath = path.join(scratchDir, 'shopify-products-import.csv');
    const csvContent = convertToCSV(allShopifyProducts);
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log(`Shopify CSV Import file saved to: ${csvPath}`);

    // 4. API Upload if Credentials exist
    if (SHOPIFY_TOKEN && SHOPIFY_TOKEN !== 'your_admin_access_token') {
      console.log(`\n--- Starting Shopify API Upload (${allShopifyProducts.length} products) ---`);
      console.log(`Targeting Store: ${SHOPIFY_DOMAIN}`);
      
      const logFile = path.join(scratchDir, 'shopify-upload-log.json');
      const uploadResults = [];

      for (let i = 0; i < allShopifyProducts.length; i++) {
        const prod = allShopifyProducts[i];
        console.log(`[${i+1}/${allShopifyProducts.length}] Uploading "${prod.title}"...`);
        
        const result = await postShopify('products.json', { product: prod });
        
        if (result.success) {
          console.log(`    SUCCESS: Created ID ${result.data.product.id}`);
          uploadResults.push({ title: prod.title, handle: prod.handle, success: true, shopifyId: result.data.product.id });
        } else {
          console.error(`    FAILED:`, result.errors);
          uploadResults.push({ title: prod.title, handle: prod.handle, success: false, errors: result.errors });
        }

        // Write upload log incrementally in case script fails mid-way
        fs.writeFileSync(logFile, JSON.stringify(uploadResults, null, 2));

        // Rate limiting delay (2 calls/sec is Shopify standard limit, so 550ms delay is safe)
        await delay(550);
      }
      
      console.log(`\nAPI Upload completed! Results logged to: ${logFile}`);
    } else {
      console.log('\n--- Shopify API Integration Skipped ---');
      console.log('To automatically upload all products via API:');
      console.log('1. Set SHOPIFY_ADMIN_ACCESS_TOKEN in .env.local');
      console.log('2. Run this script again.');
      console.log('OR you can manually import the generated CSV file "scratch/shopify-products-import.csv" in Shopify Admin.');
    }

  } catch (err) {
    console.error('Migration failed with critical error:', err);
  }
}

runMigration();
