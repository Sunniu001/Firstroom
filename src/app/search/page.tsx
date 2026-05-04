
import { CategoryProductGrid } from "@/components/Category/CategoryProductGrid";
import styles from "./page.module.css";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string, page?: string }>
}) {
  const { q: query = '', page: pageParam = '1' } = await searchParams;
  const currentPage = parseInt(pageParam);
  
  let products = [];
  let totalPages = 1;

  if (query) {
    try {
      // Use our internal API route which has strict title filtering
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      const host = process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000';
      
      // In server components, we often need full URLs or can use the relative fetch if using a helper
      // However, for simplicity and to ensure the filter works, I'll fetch from our own API
      const response = await fetch(`${protocol}://${host}/api/search?q=${encodeURIComponent(query)}&type=products`);
      if (response.ok) {
        products = await response.json();
      }
    } catch (e) {
      console.error("Search fetch failed:", e);
    }
  }

  return (
    <div className={styles.container} style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Search Results</h1>
          {query && (
            <p className={styles.queryText}>
              {products.length > 0 
                ? `${products.length} product${products.length > 1 ? 's' : ''} found for "${query}"`
                : `Showing results for "${query}"`
              }
            </p>
          )}

          <div className={styles.gridContainer}>
            {(!products || products.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p className={styles.emptyMessage}>No products found for your search.</p>
                <Link href="/" style={{ color: '#8FA899', textDecoration: 'underline', marginTop: '20px', display: 'inline-block' }}>
                  Back to Home
                </Link>
              </div>
            ) : (
              <CategoryProductGrid 
                products={products} 
                showCategory={true} 
              />
            )}
          </div>

          {/* Simple pagination if we had more info, but for now let's focus on showing results */}
        </div>
      </main>
    </div>
  );
}
