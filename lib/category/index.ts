import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

// Mendapatkan semua kategori
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
      })
      .from(category)
      .orderBy(desc(category.id));

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Gagal mengambil data kategori");
  }
}

// Mendapatkan kategori berdasarkan ID
export async function getCategoryById(id: number): Promise<Category | undefined> {
  try {
    const [result] = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
      })
      .from(category)
      .where(eq(category.id, id));

    return result;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw new Error("Gagal mengambil data kategori");
  }
}

// Membuat kategori baru
export async function createCategory(data: Omit<Category, 'id'>): Promise<Category> {
  try {
    const [newCategory] = await db
      .insert(category)
      .values({
        name: data.name,
        description: data.description,
      })
      .returning({
        id: category.id,
        name: category.name,
        description: category.description,
      });

    return newCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Gagal membuat kategori baru");
  }
}

// Memperbarui kategori
export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  try {
    const [updatedCategory] = await db
      .update(category)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(category.id, id))
      .returning({
        id: category.id,
        name: category.name,
        description: category.description,
      });

    return updatedCategory;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Gagal memperbarui kategori");
  }
}

// Menghapus kategori
export async function deleteCategory(id: number): Promise<boolean> {
  try {
    await db.delete(category).where(eq(category.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Gagal menghapus kategori");
  }
}