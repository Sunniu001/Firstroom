# Shopify Theme Sections — Landing Page

These are the custom Liquid section files that replicate your **First Room Collective Next.js landing page** exactly, designed to be used via the **Shopify Theme Customizer (drag & drop)**.

---

## Sections Included

| File | Section Name | What It Replicates |
|---|---|---|
| `sections/fr-hero.liquid` | FR Hero | Hero with parallax background, overlay, title, subtitle, SHOP NOW button |
| `sections/fr-feature-split.liquid` | FR Feature Split | Text + image side-by-side blocks (asymmetric border radius) |
| `sections/fr-category-grid.liquid` | FR Category Grid | 2-row grid of 6 category cards with hover zoom |
| `sections/fr-video-section.liquid` | FR Video Section | Full-width autoplay video with serif heading |

---

## How to Install in Shopify

### Step 1: Open the Shopify Code Editor

1. Go to **Shopify Admin → Online Store → Themes**
2. On your active theme, click the **three dots (...)** → **Edit code**

### Step 2: Upload Each Section File

1. In the left sidebar, scroll to the **Sections** folder
2. Click **Add a new section**
3. Name it exactly (without `.liquid` extension):
   - `fr-hero`
   - `fr-feature-split`
   - `fr-category-grid`
   - `fr-video-section`
4. Delete the default placeholder code inside each file
5. Paste the contents of the matching `.liquid` file from the `sections/` folder here
6. Click **Save** after each one

---

## Step 3: Add Sections to the Homepage in the Theme Customizer

1. Go to **Online Store → Themes → Customize**
2. In the top dropdown, select **Home page**
3. In the left sidebar, click **Add section** at the bottom
4. Add them in this order:
   1. **FR Hero** — set background image, title, subtitle, and Shop Now button link
   2. **FR Feature Split** — set `Image Position: Right`, add the main image, illustration, title and text
   3. **FR Category Grid** — add 6 category blocks (3 in Row 1, 3 in Row 2), set each image and label
   4. **FR Feature Split** (second one) — set `Image Position: Left`, add the second image, text, and illustration
   5. **FR Video Section** — upload your video or paste a YouTube/Vimeo link
5. Click **Save** when done

---

## Step 4: Add Google Fonts

Add these two fonts to your theme's `<head>` tag so the typography matches exactly:

1. In the code editor, open **Layout → theme.liquid**
2. Inside the `<head>` tag, paste:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Lato:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## Landing Page Section Order

```
┌─────────────────────────────────────────────┐
│  FR Hero                                    │
│  (Parallax hero with SHOP NOW button)       │
├─────────────────────────────────────────────┤
│  FR Feature Split (Image Right)             │
│  "Cultural Motifs, Modern Aesthetic"        │
├─────────────────────────────────────────────┤
│  FR Category Grid                           │
│  Row 1: Wallpaper | Nameplate | Desk Decor  │
│  Row 2: Decals    | Frames    | Kids WP     │
├─────────────────────────────────────────────┤
│  FR Feature Split (Image Left)              │
│  "Themes Rooted In Heritage"                │
├─────────────────────────────────────────────┤
│  FR Video Section                           │
│  "When Your Vision Becomes Your Space"      │
└─────────────────────────────────────────────┘
```

---

## Images to Upload to Shopify Files

Upload these images from your `/public/images/` folder to **Shopify Admin → Content → Files**:

| Usage | Filename |
|---|---|
| Hero background | `Hero-Page-Image-1.webp` |
| Feature block 1 main image | `cultural-motifs-detail-1536x864.webp` |
| Feature block 1 illustration | `placeholder-new2-1-e1774865047238.webp` |
| Feature block 2 main image | `themes-rooted-1536x864.webp` |
| Feature block 2 illustration | `placeholder2.webp` |
| Category: Wallpaper | `wallpaper-1536x1536.webp` |
| Category: Nameplate | `Name-plate-1536x1536.webp` |
| Category: Desk Decor | `Desk-deco-1536x1536.webp` |
| Category: Decals | `Decals-1536x1536.webp` |
| Category: Frames | `Frame-1536x1536.webp` |
| Category: Kids Wallpaper | `kids-wallpaper-1536x1536.webp` |
| Landing page video | `Landing page video.mp4` |
