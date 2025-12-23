import { NextRequest } from "next/server";
import {
  getAllLoans,
  addLoan,
  updateLoan,
} from "@/actions/loans";

export async function GET(request: NextRequest) {
  try {
    const loans = await getAllLoans();
    return Response.json({ success: true, data: loans });
  } catch (error) {
    console.error("Error in GET /api/loans:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil peminjaman" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    await addLoan(formData);

    return Response.json({ success: true, message: "Peminjaman berhasil ditambahkan" });
  } catch (error) {
    console.error("Error in POST /api/loans:", error);
    return Response.json(
      { success: false, error: "Gagal menambahkan peminjaman" },
      { status: 500 }
    );
  }
}