const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const api = new WooCommerceRestApi({
  url: "https://firstroom.in",
  consumerKey: "ck_364949c20cf7f981961b6f4a708b9034aa7b24f9",
  consumerSecret: "cs_042042bf375c5e662ab6b4dbd669caafa3572f78",
  version: "wc/v3",
  queryStringAuth: true
});

api.get("products", { per_page: 1 })
  .then((res) => console.log("SUCCESS:", res.data.length, "items"))
  .catch((err) => console.log("ERROR:", err.response?.data || err));
