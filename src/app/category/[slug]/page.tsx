import { getProductsByCategory } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { Card } from "@/components/Card/Card";
import { Grid } from "@/components/Grid/Grid";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const currentCategory = categories.find((c) => c.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  // Check for child categories
  const subcategories = categories.filter((c) => c.parent === currentCategory.id);

  let content;

  if (subcategories.length > 0) {
    // Parent Category View: Show subcategories as large image cards
    content = (
      <Grid columns={4} gap="xl">
        {subcategories.map((sub) => (
          <Link key={sub.id} href={`/category/${sub.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Card
              title={sub.name}
              image={sub.image}
            />
          </Link>
        ))}
      </Grid>
    );
  } else {
    // Leaf Category View: Fetch and show products
    const products = await getProductsByCategory(currentCategory.id.toString());
    
    if (!products || products.length === 0) {
      content = <p style={{ color: "var(--text-secondary)", textAlign: "center", marginTop: "var(--spacing-xl)" }}>No products found in this category.</p>;
    } else {
      content = (
        <Grid columns={4} gap="xl">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <Card
                title={product.name}
                price={`₹${product.price}`}
                image={product.images?.[0]?.src}
              />
            </Link>
          ))}
        </Grid>
      );
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "var(--spacing-xxl) var(--spacing-lg)" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            marginBottom: "var(--spacing-xl)", 
            fontFamily: "var(--font-serif)", 
            fontWeight: 400, 
            textAlign: "center" 
          }}>
            {currentCategory.name}
          </h1>
          
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "30px" }}>
             <button style={{ background: "transparent", border: "1px solid var(--border-color)", padding: "8px", cursor: "pointer", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
               </svg>
             </button>
          </div>

          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}
