import { getProductsByCategory } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Card } from "@/components/Card/Card";
import { Grid } from "@/components/Grid/Grid";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryProductGrid } from "@/components/Category/CategoryProductGrid";

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

  const categories = await getCategories();
  let currentCategory = categories.find((c) => c.slug === slug);

  // Fallback: Multi-strategy lookup
  if (!currentCategory) {
    const decodedSlug = decodeURIComponent(slug);
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
      console.warn("Direct category lookup failed, trying product-based discovery...");
    }

    if (!currentCategory) {
      try {
        const { fetchStoreApi } = await import("@/lib/api/client");
        const { data: productsData } = await fetchStoreApi<any[]>(`products?category=${decodedSlug}&per_page=1`);
        if (productsData && productsData.length > 0) {
          const firstProduct = productsData[0];
          const catData = firstProduct.categories?.find((c: any) => c.slug === decodedSlug);
          if (catData) {
            currentCategory = {
              id: catData.id,
              name: catData.name,
              slug: catData.slug,
              parent: catData.parent || 0,
              image: undefined,
            };
          } else {
            console.warn(`Category discovery returned product but no matching category for slug: ${decodedSlug}`);
          }
        }
      } catch (e) {
        console.error("Product-based discovery failed:", e);
      }
    }
  }

  if (!currentCategory) {
    notFound();
  }

  // Check for child categories
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

  // Fetch products (Always, for both leaf and parent categories)
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#ffffff" }}>
      <main style={{ flex: 1, padding: "20px 40px 60px 40px" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          
          <h1 style={{ 
            fontSize: "42px", 
            marginTop: "0",
            marginBottom: "40px", 
            fontFamily: "var(--font-serif)", 
            fontWeight: 400, 
            textAlign: "center",
            color: "#1a1a1a"
          }}>
            {currentCategory.name}
          </h1>

          {/* Products Grid */}

          <div style={{ padding: "0 5px" }}>
            {(!products || products.length === 0) ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "var(--spacing-xl)" }}>No products found in this category.</p>
            ) : (
              <CategoryProductGrid products={products} unit={isWallpaper ? "sq. ft." : undefined} showCategory={isParentCategory} />

            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              marginTop: "80px", 
              gap: "24px" 
            }}>
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === currentPage;
                const sortQuery = sortParam ? `&sort=${sortParam}` : '';
                return (
                  <Link 
                    key={pageNum}
                    href={`/category/${slug}?page=${pageNum}${sortQuery}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      backgroundColor: isActive ? "#8FA899" : "transparent",
                      color: isActive ? "#ffffff" : "#999999",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      borderRadius: "2px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {pageNum}
                  </Link>
                );
              })}
              
              {currentPage < totalPages && (
                <Link 
                  href={`/category/${slug}?page=${currentPage + 1}${sortParam ? `&sort=${sortParam}` : ''}`}
                  style={{
                    color: "#333",
                    textDecoration: "none",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "-8px"
                  }}
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
