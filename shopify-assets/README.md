# Shopify Integration Guide: Customizers Migration

This folder contains the native Liquid code files needed to recreate the **Nameplate Personalizer** and **Wallpaper Dimensions Calculator** on a standalone Shopify store. 

Shopify handles custom inputs natively using **Line Item Properties**. When customers submit the product page form, these properties (e.g. customized name, font, wallpaper dimensions, material) are sent to the cart, displaying automatically in the checkout, admin dashboard, and order receipts.

---

## 1. Setup Customizer Metafields

To enable the Nameplate Personalizer on specific products, you must configure Product Metafields in your Shopify admin panel.

1. Go to **Shopify Admin > Settings > Custom data > Products**.
2. Click **Add definition** to create the following three metafields under the `custom` namespace:

### Metafield 1: Mockup Background Image
* **Name**: Nameplate Mockup BG
* **Namespace and key**: `custom.np_bg`
* **Type**: File (Limit to images only) or URL

### Metafield 2: Coordinate Box Bounds
* **Name**: Nameplate Coordinate Box
* **Namespace and key**: `custom.np_box`
* **Type**: Single line text
* **Format**: A comma-separated list of coordinates representing `x,y,width,height` in pixels relative to the original image size. 
  * *Example*: `240,150,300,90`
  * (This determines where the dynamic font name text is rendered on the nameplate picture)

### Metafield 3: Mockup Text Color
* **Name**: Nameplate Text Color
* **Namespace and key**: `custom.np_text_color`
* **Type**: Single line text
* **Options**: Set to `light` (for white text with gray shadow) or `dark` (for charcoal text with dark shadow).

---

## 2. Install customizers in Shopify Theme

Both customizers are designed to be inserted directly inside the **Product Form** on your product page. They can be added to any standard Shopify Online Store theme (like Dawn, Sense, or custom premium themes).

### Method A: Custom Liquid Block (Recommended & Easy)
1. Go to **Shopify Admin > Online Store > Themes**.
2. Click **Customize** on your active theme.
3. Select **Products > Default product** from the top page dropdown list.
4. In the left sidebar, locate the **Product information** section.
5. Click **Add block** and select **Custom Liquid**.
6. Move the block so it sits directly above the "Buy buttons" block (but below the variant selectors).
7. Copy the contents of the Liquid file and paste it into the Custom Liquid code box:
   * Paste [nameplate-personalizer.liquid](file:///Users/sunniy/Documents/AG%20FR%20copy/firstroom-frontend/shopify-assets/nameplate-personalizer.liquid) for Nameplate products.
   * Paste [wallpaper-calculator.liquid](file:///Users/sunniy/Documents/AG%20FR%20copy/firstroom-frontend/shopify-assets/wallpaper-calculator.liquid) for Wallpaper products.
8. Click **Save**.

### Method B: Theme Code Snippet
1. Click the **three dots (...)** next to Customize and click **Edit code**.
2. Create two new files in the **Snippets** directory:
   * `fr-nameplate-personalizer.liquid`
   * `fr-wallpaper-calculator.liquid`
3. Paste the contents of the respective files.
4. Locate the `main-product.liquid` or `buy-buttons.liquid` file in your **Sections** or **Snippets** directory.
5. Include the snippet directly inside the `<form>` element:
   ```liquid
   {% render 'fr-nameplate-personalizer' %}
   {% render 'fr-wallpaper-calculator' %}
   ```

---

## 3. Product Catalog Setup & Pricing

### For Nameplates
* Configure the nameplate product variants normally (e.g. Medium, Large).
* Fill in the Metafields (`custom.np_bg`, `custom.np_box`, `custom.np_text_color`) for each personalization product. 
* *Note*: If a product does not have these metafields populated, the personalizer script will automatically hide itself.

### For Wallpapers
* **Unit Pricing**: In Shopify, set the product variant prices to represent the **price per square foot** (e.g. ₹250).
* **Tags/Type**: Add the tag `wallpaper` or set the product Type to `Wallpaper` in the Shopify admin product details. (The script checks these fields to show the calculator).
* **Variants**: Create a product option named `Material` (e.g. Leather-Finished, Velvet, Canvas). The calculator script will automatically read these values, display them as clean custom choice buttons, and link them to the theme's native selectors.
* **Calculation**: The calculator intercepts checkout submission. If a user sets dimensions to `10 ft height` by `10 ft width` (100 sq.ft.) and selects `1` quantity, the script dynamically adjusts the hidden Shopify form input `name="quantity"` to `100`. The cart total is set to 100 * ₹250 = ₹25,000, charging the correct area-based pricing.
