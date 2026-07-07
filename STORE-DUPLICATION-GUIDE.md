# Firstroom Store — Duplication Guide

This guide explains how to use this repository to set up a **complete copy** of the Firstroom store on a new Shopify account.

---

## What's Included

| Component | Location | Description |
|---|---|---|
| **Next.js Frontend** | `src/` | All pages, components, API routes, styles, state management |
| **Shopify Liquid Theme** | `horizon-theme/` | Full custom theme — header, footer, sections, snippets, templates |
| **Shopify Custom Assets** | `shopify-assets/` | Wallpaper calculator, nameplate personalizer, cart display |
| **Migration Scripts** | `scripts/` | WooCommerce → Shopify product migration tools |
| **Configuration** | `package.json`, `tsconfig.json`, `next.config.ts` | Build and dependency config |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

---

## Step 2: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials:

1. **Shopify**: Get your store domain and access tokens from [Shopify Admin → Settings → Apps → Develop apps](https://admin.shopify.com/)
2. **Razorpay**: Get keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)
3. **Google OAuth**: Set up at [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. **Auth Secret**: Generate with `openssl rand -base64 32`

---

## Step 3: Install Dependencies & Run

```bash
npm install
npm run dev
```

Your frontend will be running at `http://localhost:3000`.

---

## Step 4: Deploy the Shopify Theme

The `horizon-theme/` directory contains the full Liquid theme. To deploy it to your Shopify store:

### Option A: Via Shopify CLI
```bash
# Install Shopify CLI if you haven't
npm install -g @shopify/cli @shopify/theme

# Navigate to the theme directory
cd horizon-theme

# Push to your store
shopify theme push --store=your-store.myshopify.com
```

### Option B: Manual Upload
1. Zip the contents of `horizon-theme/`
2. Go to **Shopify Admin → Online Store → Themes**
3. Click **Add theme → Upload zip file**

---

## Step 5: Install Custom Shopify Assets

The `shopify-assets/` directory contains custom Liquid snippets:

- **`wallpaper-calculator.liquid`** — Wallpaper measurement calculator
- **`nameplate-personalizer.liquid`** — Custom nameplate text personalizer
- **`fr-cart-wallpaper-display.liquid`** — Cart wallpaper display component

### To install:
1. Go to **Shopify Admin → Online Store → Themes → Edit code**
2. Under **Snippets**, click **Add a new snippet**
3. Copy-paste each `.liquid` file's contents

---

## Step 6: Migrate Products (Optional)

If you're migrating products from a WooCommerce store:

```bash
# Make sure WC_CONSUMER_KEY and WC_CONSUMER_SECRET are set in .env.local
node scripts/migrate-products.js
```

This will:
1. Fetch all products from WooCommerce
2. Map them to Shopify format (handling wallpapers, nameplates, variants)
3. Generate a CSV at `scratch/shopify-products-import.csv`
4. Upload directly via Shopify API if `SHOPIFY_ADMIN_ACCESS_TOKEN` is set

### Manual CSV Import
If you prefer manual import:
1. Run the script to generate the CSV
2. Go to **Shopify Admin → Products → Import**
3. Upload `scratch/shopify-products-import.csv`

---

## Step 7: Deploy the Frontend

### Vercel (Recommended)
1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Set all environment variables from `.env.local` in Vercel dashboard
4. Deploy

### Other Platforms
The app is a standard Next.js application. It can be deployed to any platform that supports Next.js (Netlify, Railway, AWS Amplify, etc.).

---

## Project Structure

```
firstroom-frontend/
├── src/                    # Next.js application
│   ├── app/                # App router pages & API routes
│   ├── components/         # React components
│   ├── lib/                # Utilities & Shopify client
│   ├── store/              # Zustand state management
│   ├── styles/             # CSS stylesheets
│   └── types/              # TypeScript types
├── horizon-theme/          # Shopify Liquid theme
│   ├── assets/             # CSS, JS, images
│   ├── blocks/             # Theme blocks
│   ├── config/             # Theme settings
│   ├── layout/             # Theme layouts
│   ├── locales/            # Translations
│   ├── sections/           # Theme sections
│   ├── snippets/           # Reusable snippets
│   └── templates/          # Page templates (JSON)
├── shopify-assets/         # Standalone Liquid components
├── scripts/                # Migration & utility scripts
├── public/                 # Static assets
├── .env.example            # Environment variable template
└── package.json            # Dependencies & scripts
```

---

## Troubleshooting

- **"Module not found"**: Run `npm install` to ensure all dependencies are installed
- **Shopify API errors**: Verify your access tokens in `.env.local` and check the API version
- **Theme push fails**: Make sure you're authenticated with `shopify auth login`
- **Products not showing**: Check that products are set to "Active" status in Shopify Admin
