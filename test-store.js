

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

async function testV3() {
  const api = new WooCommerceRestApi({
    url: "https://firstroom.in",
    consumerKey: "ck_364949c20cf7f981961b6f4a708b9034aa7b24f9",
    consumerSecret: "cs_042042bf375c5e662ab6b4dbd669caafa3572f78",
    version: "wc/v3",
    queryStringAuth: true
  });

  const res = await api.get("products/4756");
  const data = res.data;

  if (data.variations && data.variations.length > 0) {
    console.log("Variations array (IDs only):", data.variations);
    
    // fetch one variation
    const varRes = await api.get(`products/4756/variations/${data.variations[0]}`);
    console.log("Variation Data:", JSON.stringify(varRes.data, null, 2));
  } else {
    console.log("No variations");
  }
}

testV3();

testStoreAPI();
