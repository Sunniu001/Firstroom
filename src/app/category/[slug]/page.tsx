import type { Metadata } from "next";
import { getProductsByCategory } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Card } from "@/components/Card/Card";
import { Grid } from "@/components/Grid/Grid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/Category/CategoryProductGrid";
import { CategoryBanner } from "@/components/Category/CategoryBanner";

export const dynamic = 'force-dynamic';

import styles from "./page.module.css";

const CATEGORY_BANNERS: Record<string, {
  tagline: string;
  description: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  sideImage: string;
  isFullImage?: boolean;
  titleAccent?: string;
  titleScript?: string;
  titleSuffix?: string;
}> = {
  'artistic': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp",
    isFullImage: true
  },
  'artistic-wallpaper': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp", // Client's updated Artistic graphic
    isFullImage: true
  },
  'botanical': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Botanical Wallpaper Category Banner.webp",
    isFullImage: true
  },
  'botanical-rhythm': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Botanical Wallpaper Category Banner.webp",
    isFullImage: true
  },
  'botanical-rhythm-wallpaper': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Botanical Wallpaper Category Banner.webp", // Client's updated Botanical graphic
    isFullImage: true
  },
  'wallpaper': {
    tagline: "",
    description: "",
    backgroundColor: "transparent",
    textColor: "inherit",
    accentColor: "transparent",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp", // Default general fallback graphic
    isFullImage: true
  },
  'kids-wallpaper': {
    tagline: "WHIMSICAL & DREAMY",
    description: "Soft, whimsical illustrations designed to spark wonder, turning nurseries and bedrooms into safe, inspiring environments of endless imagination.",
    backgroundColor: "#F4F1ED",
    textColor: "#2B2B2B",
    accentColor: "#E07B53",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  },
  'nameplate': {
    tagline: "ELEGANT WELCOME",
    description: "Handcrafted with premium woods, polished brass, and traditional details to welcome guests to your home with distinct refinement and personalization.",
    backgroundColor: "#2B3A2C",
    textColor: "#F9F6F0",
    accentColor: "#E8D5B7",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  },
  'desk-quote': {
    tagline: "ARTFUL ACCENTS",
    description: "Elegant inspirational highlights designed to elevate your workspace or creative corners, pairing premium materials with thoughtful typography.",
    backgroundColor: "#F4F1ED",
    textColor: "#2B2B2B",
    accentColor: "#E07B53",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  },
  'decals': {
    tagline: "MODERN MOTIFS",
    description: "Elegant wall transfers and self-adhesive patterns designed to seamlessly accent your surfaces with modern architectural details.",
    backgroundColor: "#2B3A2C",
    textColor: "#F9F6F0",
    accentColor: "#E8D5B7",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  },
  'frame': {
    tagline: "CURATED ART",
    description: "High-fidelity prints framed in exquisite moldings, bringing gallery-grade refinement and custom layouts to your home gallery walls.",
    backgroundColor: "#262626",
    textColor: "#F9F6F0",
    accentColor: "#A38B5C",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  },
  'home-decor': {
    tagline: "ELEGANT INTERIORS",
    description: "Discover our curated collection of luxury home accents, designed and handcrafted to welcome refined style into every corner of your home.",
    backgroundColor: "#F4F1ED",
    textColor: "#2B2B2B",
    accentColor: "#E07B53",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp"
  }
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let currentCategory = null;

  try {
    const { wcFetch } = await import("@/lib/api/client");
    const catSearch = await wcFetch<any[]>(`products/categories?slug=${decodedSlug}`);
    if (catSearch && catSearch.length > 0) {
      currentCategory = catSearch[0];
    }
  } catch (e) {
    console.warn("Metadata lookup failed:", e);
  }

  if (!currentCategory) {
    try {
      const categories = await getCategories();
      currentCategory = categories.find((c) => c.slug === slug || c.slug === decodedSlug);
    } catch (e) {}
  }

  const name = currentCategory?.name || decodedSlug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const desc = currentCategory?.description || "Transform your space with luxury home accents and premium wall decor from First Room Collective.";

  return {
    title: `${name} | First Room Collective`,
    description: desc,
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ page?: string, sort?: string }>
}) {
  const { slug } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;
  const currentPage = parseInt(pageParam || "1");
  const decodedSlug = decodeURIComponent(slug);

  let currentCategory = null;

  // Strategy 1: Direct Fetch (Most reliable for Vercel/Next.js)
  try {
    const { wcFetch } = await import("@/lib/api/client");
    const catSearch = await wcFetch<any[]>(`products/categories?slug=${decodedSlug}`);
    if (catSearch && catSearch.length > 0) {
      const cat = catSearch[0];
      currentCategory = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent || 0,
        image: cat.image?.src || cat.image,
        description: cat.description || "",
      };
    }
  } catch (e) {
    console.warn("Direct category lookup failed:", e);
  }

  // Strategy 2: Multi-category fetch (Fallback)
  if (!currentCategory) {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === slug || c.slug === decodedSlug);
    if (cat) {
      currentCategory = {
        ...cat,
        description: (cat as any).description || "",
      };
    }
  }

  if (!currentCategory) {
    return (
      <div className={styles.main} style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)" }}>Category Not Found</h1>
        <p style={{ color: "#666", marginTop: "20px" }}>Requested Slug: {slug}</p>
        <Link href="/" style={{ marginTop: "40px", display: "inline-block", color: "#8FA899" }}>Return Home</Link>
      </div>
    );
  }

  // Check for child categories
  const categories = await getCategories();
  const subcategories = categories.filter((c) => c.parent === currentCategory.id);

  // Sorting logic
  let orderby = 'date';
  let order = 'desc';
  switch (sortParam) {
    case 'price_asc': orderby = 'price'; order = 'asc'; break;
    case 'price_desc': orderby = 'price'; order = 'desc'; break;
    case 'popularity': orderby = 'popularity'; order = 'desc'; break;
    case 'date': orderby = 'date'; order = 'desc'; break;
    default: orderby = 'date'; order = 'desc';
  }

  // Fetch products
  const { products, totalPages } = await getProductsByCategory(
    currentCategory.id.toString(),
    currentPage,
    20,
    orderby,
    order
  );

  const isWallpaper = currentCategory.name.toLowerCase().includes('wallpaper') ||
    currentCategory.name.toLowerCase().includes('mural') ||
    slug.includes('wallpaper') ||
    slug.includes('mural');

  const isParentCategory = slug === 'wallpapers' || slug === 'home-decor';

  // Normalize key lookup for custom banners (longer specific keys checked first)
  const slugKey = slug.toLowerCase();
  let bannerConfig = CATEGORY_BANNERS[slugKey];
  
  if (!bannerConfig) {
    const sortedKeys = Object.keys(CATEGORY_BANNERS).sort((a, b) => b.length - a.length);
    const matchingKey = sortedKeys.find(key => 
      slugKey.includes(key) || key.includes(slugKey)
    );
    if (matchingKey) {
      bannerConfig = CATEGORY_BANNERS[matchingKey];
    }
  }

  // Dynamically extract name parts for dynamic calligraphic script splitting
  const nameParts = currentCategory.name.split(' ');
  const dynamicScript = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : currentCategory.name;
  const dynamicSuffix = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() + " collection" : "collection";

  const fallbackBanner = {
    tagline: "EXPLORE THE COLLECTION",
    description: currentCategory.description || "",
    backgroundColor: "#FAF8F5", // elegant off-white
    textColor: "#222222",
    accentColor: "#8FA899",
    sideImage: "/images/Artistic Wallpaper Category Banner.webp", // Default general fallback banner graphic
    titleAccent: "Explore our",
    titleScript: dynamicScript,
    titleSuffix: dynamicSuffix,
    isFullImage: true, // Make overlaid banner the unified template for ALL category pages by default!
  };

  const activeBanner = {
    ...fallbackBanner,
    ...bannerConfig,
    description: bannerConfig?.description !== undefined ? bannerConfig.description : (currentCategory.description || "")
  };

  return (
    <div className={styles.container} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          
          {/* Premium Client-Side Parallax Category Banner */}
          <CategoryBanner 
            currentCategoryName={currentCategory.name} 
            activeBanner={activeBanner} 
          />

          <div className={styles.gridContainer}>
            {(!products || products.length === 0) ? (
              <p className={styles.emptyMessage}>No products found in this category.</p>
            ) : (
              <CategoryProductGrid products={products} unit={isWallpaper ? "sq. ft." : undefined} showCategory={isParentCategory} />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                const sortQuery = sortParam ? `&sort=${sortParam}` : '';
                return (
                  <Link
                    key={pageNum}
                    href={`/category/${slug}?page=${pageNum}${sortQuery}`}
                    className={`${styles.pageLink} ${isActive ? styles.pageLinkActive : ""}`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={`/category/${slug}?page=${currentPage + 1}${sortParam ? `&sort=${sortParam}` : ''}`}
                  className={styles.nextLink}
                >
                  &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
