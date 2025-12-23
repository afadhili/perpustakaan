import { NextRequest } from "next/server";
import { getCategories, createCategory } from "@/lib/category";

export async function GET() {
  try {
    const categories = await getCategories();
    return Response.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error in GET /api/category:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil kategori" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validasi input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return Response.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    const newCategory = await createCategory({
      name: name.trim(),
      description: description || null,
    });
    return Response.json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Error in POST /api/category:", error);
    return Response.json(
      { success: false, error: "Gagal menambahkan kategori" },
      { status: 500 },
    );
  }
}
