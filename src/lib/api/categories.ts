import { fetchStoreApi } from "./client";
import { Category } from "@/types/product";

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await fetchStoreApi<any[]>("products/categories");

    return data.map((cat: any) => ({
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
