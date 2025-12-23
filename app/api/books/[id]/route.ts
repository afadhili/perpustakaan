import { NextRequest } from "next/server";
import { 
  getBookById, 
  updateBook as updateBookAction, 
  deleteBook as deleteBookAction 
} from "@/actions/books";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID buku tidak valid" },
        { status: 400 }
      );
    }

    const book = await getBookById(id);
    
    if (!book) {
      return Response.json(
        { success: false, error: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: book });
  } catch (error) {
    console.error("Error in GET /api/books/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil buku" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID buku tidak valid" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    // Ambil data kategori dari form data
    const categoryIdsString = formData.get('categoryIds') as string | null;
    
    await updateBookAction(id, formData);
    
    return Response.json({ success: true, message: "Buku berhasil diperbarui" });
  } catch (error) {
    console.error("Error in PUT /api/books/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal memperbarui buku" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID buku tidak valid" },
        { status: 400 }
      );
    }

    const result = await deleteBookAction(id);
    
    if (result.success) {
      return Response.json({ success: true, message: result.message });
    } else {
      return Response.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE /api/books/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal menghapus buku" },
      { status: 500 }
    );
  }
}