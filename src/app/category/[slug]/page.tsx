import { getProductsByCategory } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Card } from "@/components/Card/Card";
import { Grid } from "@/components/Grid/Grid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/Category/CategoryProductGrid";

export const dynamic = 'force-dynamic';

import styles from "./page.module.css";

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
    const catSearch = await wcFetch(`products/categories?slug=${decodedSlug}`);
    if (catSearch && catSearch.length > 0) {
      const cat = catSearch[0];
      currentCategory = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent: cat.parent || 0,
        image: cat.image?.src || cat.image,
      };
    }
  } catch (e) {
    console.warn("Direct category lookup failed:", e);
  }

  // Strategy 2: Multi-category fetch (Fallback)
  if (!currentCategory) {
    const categories = await getCategories();
    currentCategory = categories.find((c) => c.slug === slug || c.slug === decodedSlug);
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

  return (
    <div className={styles.container} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>
            {currentCategory.name}
          </h1>

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
