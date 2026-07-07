const fs = require('fs');
const path = require('path');

// Helper to parse .env.local file manually since dotenv might not be installed
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
  return env;
}

const env = loadEnv();
const SHOPIFY_DOMAIN = env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_TOKEN = env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_VERSION = '2024-04';

if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
  console.error("Missing Shopify credentials in .env.local");
  process.exit(1);
}

async function runGraphQL(query, variables = {}) {
  const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_VERSION}/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

async function main() {
  console.log(`Checking installed Shopify Functions on store: ${SHOPIFY_DOMAIN}...`);
  const functionsQuery = `
    query {
      shopifyFunctions(first: 50) {
        nodes {
          id
          title
          apiType
        }
      }
    }
  `;
  
  const res = await runGraphQL(functionsQuery);
  if (res.errors) {
    console.error("GraphQL errors:", res.errors);
    return;
  }
  
  const nodes = res.data?.shopifyFunctions?.nodes || [];
  console.log("Installed functions:", nodes);
  
  const cartTransformFunc = nodes.find(n => n.title.includes('areapro-cart-transform') || n.apiType === 'cart_transform');
  
  if (!cartTransformFunc) {
    console.log("\n❌ AreaPro Cart Transform Function not found on this store.");
    console.log("Please install the app first on your development store:");
    console.log("👉 Visit this link: https://dev.shopify.com/dashboard/221370137/apps/378041303041/test");
    console.log("\nOnce installed, run this script again to activate it.");
    return;
  }
  
  console.log(`\nFound Function: ${cartTransformFunc.title} (ID: ${cartTransformFunc.id})`);
  console.log("Activating Cart Transform Function...");
  
  const createMutation = `
    mutation cartTransformCreate($functionId: GUID!) {
      cartTransformCreate(functionId: $functionId) {
        cartTransform {
          id
          functionId
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const createRes = await runGraphQL(createMutation, { functionId: cartTransformFunc.id });
  if (createRes.errors) {
    console.error("Mutation GraphQL errors:", createRes.errors);
    return;
  }
  
  const errors = createRes.data?.cartTransformCreate?.userErrors || [];
  if (errors.length > 0) {
    console.error("User errors:", errors);
    return;
  }
  
  console.log("\n🎉 Cart Transform Function successfully activated! ID:", createRes.data.cartTransformCreate.cartTransform.id);
}

main().catch(console.error);
