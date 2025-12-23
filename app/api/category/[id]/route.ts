import { NextRequest } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/category";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      console.log(id);
      return Response.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 },
      );
    }

    const category = await getCategoryById(id);

    if (!category) {
      return Response.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: category });
  } catch (error) {
    console.error("Error in GET /api/category/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil kategori" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const awaitedParams = await params;
    const id = parseInt(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { name, description } = body;

    // Validasi input
    if (
      name !== undefined &&
      (!name || typeof name !== "string" || name.trim().length === 0)
    ) {
      return Response.json(
        { success: false, error: "Nama kategori wajib diisi jika disediakan" },
        { status: 400 },
      );
    }

    const updatedCategory = await updateCategory(id, {
      name: name ? name.trim() : undefined,
      description: description !== undefined ? description : undefined,
    });

    if (!updatedCategory) {
      return Response.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    return Response.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error("Error in PUT /api/category/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const awaitedParams = await params;
    const id = parseInt(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 },
      );
    }

    const deleted = await deleteCategory(id);

    if (!deleted) {
      return Response.json(
        {
          success: false,
          error: "Kategori tidak ditemukan atau gagal dihapus",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error in DELETE /api/category/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 },
    );
  }
}
