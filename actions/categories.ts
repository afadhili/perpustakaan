"use server";

import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type Category = typeof category.$inferSelect;

export const getAllCategories = async () => {
  const categories = await db.select().from(category);
  return categories;
};

export const createCategory = async (data: Omit<Category, 'id'>) => {
  const [newCategory] = await db.insert(category).values(data).returning();
  return newCategory;
};

export const getCategoryById = async (id: number) => {
  const [result] = await db.select().from(category).where(eq(category.id, id));
  return result;
};

export const updateCategory = async (id: number, data: Partial<Category>) => {
  const [updatedCategory] = await db
    .update(category)
    .set(data)
    .where(eq(category.id, id))
    .returning();
  return updatedCategory;
};

export const deleteCategory = async (id: number) => {
  try {
    await db.delete(category).where(eq(category.id, id));
    return { success: true, message: "Kategori berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Gagal menghapus kategori" };
  }
};