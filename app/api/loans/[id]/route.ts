import { NextRequest } from "next/server";
import {
  getLoanById,
  updateLoan,
  deleteLoan
} from "@/actions/loans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID peminjaman tidak valid" },
        { status: 400 }
      );
    }

    const loan = await getLoanById(id);

    if (!loan) {
      return Response.json(
        { success: false, error: "Peminjaman tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: loan });
  } catch (error) {
    console.error("Error in GET /api/loans/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil peminjaman" },
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
        { success: false, error: "ID peminjaman tidak valid" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    await updateLoan(id, formData);

    return Response.json({ success: true, message: "Peminjaman berhasil diperbarui" });
  } catch (error) {
    console.error("Error in PUT /api/loans/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal memperbarui peminjaman" },
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
        { success: false, error: "ID peminjaman tidak valid" },
        { status: 400 }
      );
    }

    const result = await deleteLoan(id);

    if (result.success) {
      return Response.json({ success: true, message: result.message });
    } else {
      return Response.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE /api/loans/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal menghapus peminjaman" },
      { status: 500 }
    );
  }
}