// scripts/retry-failed-products.js
// Retries the 41 failed products. The root cause was duplicate variant option
// values within the same product (e.g. two variants both called "16 x 20 Inches").
// Fix: deduplicate variants by their option combination before uploading.

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return {};
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
const SHOPIFY_DOMAIN = env['NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN'] || 'em8r1e-kv.myshopify.com';
const SHOPIFY_TOKEN = env['SHOPIFY_ADMIN_ACCESS_TOKEN'] || '';
const SHOPIFY_VERSION = env['SHOPIFY_API_VERSION'] || '2024-04';

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
  return { status: response.status, data: await response.json() };
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function deduplicateVariants(product) {
  if (!product.variants || product.variants.length <= 1) return product;

  const seen = new Set();
  const dedupedVariants = [];

  product.variants.forEach(v => {
    // Build a unique key from all option values
    const key = [v.option1, v.option2, v.option3].filter(Boolean).join('|||');
    if (!seen.has(key)) {
      seen.add(key);
      dedupedVariants.push(v);
    }
  });

  // Rebuild options values to only include what's actually in dedupedVariants
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

async function main() {
  // Load the upload log to find failed items
  const logPath = path.resolve(__dirname, '../scratch/shopify-upload-log.json');
  const log = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  const failed = log.filter(p => !p.success);

  // Load the full mapped product data
  const allProducts = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../scratch/all-shopify-products.json'), 'utf8'
  ));

  // Build a map: handle → product data
  const handleMap = {};
  allProducts.forEach(p => { if (p.handle) handleMap[p.handle] = p; });

  console.log(`\n=== Retrying ${failed.length} Failed Products ===`);
  console.log(`Targeting Store: ${SHOPIFY_DOMAIN}\n`);

  const retryLog = [];

  for (let i = 0; i < failed.length; i++) {
    const failedItem = failed[i];
    const productData = handleMap[failedItem.handle];

    if (!productData) {
      console.log(`[${i+1}/${failed.length}] SKIP: No data for "${failedItem.title}" (handle: ${failedItem.handle})`);
      retryLog.push({ ...failedItem, retryStatus: 'SKIPPED' });
      continue;
    }

    console.log(`[${i+1}/${failed.length}] Uploading "${productData.title}"...`);

    // Apply deduplication fix
    const dedupedProduct = deduplicateVariants(productData);

    const payload = { product: { ...dedupedProduct, status: 'active' } };

    try {
      await sleep(600);
      const result = await postShopify('products.json', payload);

      if (result.status === 201 && result.data.product) {
        const createdId = result.data.product.id;
        console.log(`    SUCCESS: Created ID ${createdId}`);
        retryLog.push({ title: productData.title, handle: productData.handle, success: true, shopifyId: createdId, retryStatus: 'SUCCESS' });
        // Update the main log entry
        const logIdx = log.findIndex(p => p.handle === failedItem.handle);
        if (logIdx !== -1) { log[logIdx].success = true; log[logIdx].shopifyId = createdId; }
      } else {
        console.log(`    FAILED:`, JSON.stringify(result.data.errors || result.data.product || result.data));
        retryLog.push({ title: productData.title, handle: productData.handle, success: false, retryStatus: 'FAILED', errors: result.data.errors });
      }
    } catch (err) {
      console.log(`    ERROR: ${err.message}`);
      retryLog.push({ title: productData.title, handle: productData.handle, success: false, retryStatus: 'ERROR', error: err.message });
    }
  }

  // Save updated logs
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  const retryLogPath = path.resolve(__dirname, '../scratch/retry-upload-log.json');
  fs.writeFileSync(retryLogPath, JSON.stringify(retryLog, null, 2));

  const succeeded = retryLog.filter(p => p.retryStatus === 'SUCCESS').length;
  const skipped = retryLog.filter(p => p.retryStatus === 'SKIPPED').length;
  const stillFailed = retryLog.filter(p => p.retryStatus === 'FAILED' || p.retryStatus === 'ERROR').length;

  console.log('\n=== Retry Complete ===');
  console.log(`Newly uploaded:  ${succeeded}`);
  console.log(`Skipped:         ${skipped}`);
  console.log(`Still failing:   ${stillFailed}`);
  console.log(`Total in Shopify (approx): ${286 + succeeded}`);
}

main().catch(console.error);
