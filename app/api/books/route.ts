import { NextRequest } from "next/server";
import { 
  getAllbooks, 
  addBook as addBookAction, 
  updateBook as updateBookAction, 
  deleteBook as deleteBookAction 
} from "@/actions/books";

export async function GET(request: NextRequest) {
  try {
    const books = await getAllbooks();
    return Response.json({ success: true, data: books });
  } catch (error) {
    console.error("Error in GET /api/books:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil buku" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Next.js 15+ menerima FormData secara langsung
    const formData = await request.formData();
    
    // Kita perlu menangani kategori secara khusus karena ini adalah array
    const categoryIdsString = formData.get('categoryIds') as string | null;
    const categoryIds = categoryIdsString ? JSON.parse(categoryIdsString) : [];
    
    // Buat FormData baru tanpa categoryIds yang merupakan array
    const newFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key !== 'categoryIds') {
        newFormData.append(key, value);
      }
    }
    
    // Gunakan action untuk menambah buku
    await addBookAction(newFormData);
    
    // Di sini kita perlu menambahkan logika untuk menghubungkan kategori dengan buku
    // Karena addBookAction hanya menangani tabel buku, bukan relasi
    
    return Response.json({ success: true, message: "Buku berhasil ditambahkan" });
  } catch (error) {
    console.error("Error in POST /api/books:", error);
    return Response.json(
      { success: false, error: "Gagal menambahkan buku" },
      { status: 500 }
    );
  }
}