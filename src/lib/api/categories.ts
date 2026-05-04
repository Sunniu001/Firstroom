import { fetchStoreApi } from "./client";
import { Category } from "@/types/product";

export async function getCategories(): Promise<Category[]> {
  try {
    const pages = [1, 2, 3, 4, 5];
    const results = await Promise.all(
      pages.map(page =>
        fetchStoreApi<any[]>(`products/categories?per_page=100&page=${page}`, null, {
          next: { revalidate: 86400, tags: ['categories'] }
        }).catch(() => ({ data: [] }))
      )
    );
    console.log("categories:", results);


    const allData = results.flatMap(result => result.data || []);

    return allData.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      parent: cat.parent,
      image: cat.image?.src || cat.image,
    }));
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

