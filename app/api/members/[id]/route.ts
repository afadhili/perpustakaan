import { NextRequest } from "next/server";
import { 
  getMemberById, 
  updateMember, 
  deleteMember 
} from "@/actions/members";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const awaitedParams = await params;
    const id = Number(awaitedParams.id);

    if (isNaN(id)) {
      return Response.json(
        { success: false, error: "ID anggota tidak valid" },
        { status: 400 }
      );
    }

    const member = await getMemberById(id);
    
    if (!member) {
      return Response.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: member });
  } catch (error) {
    console.error("Error in GET /api/members/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil anggota" },
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
        { success: false, error: "ID anggota tidak valid" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    await updateMember(id, formData);
    
    return Response.json({ success: true, message: "Anggota berhasil diperbarui" });
  } catch (error) {
    console.error("Error in PUT /api/members/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal memperbarui anggota" },
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
        { success: false, error: "ID anggota tidak valid" },
        { status: 400 }
      );
    }

    const result = await deleteMember(id);
    
    if (result.success) {
      return Response.json({ success: true, message: result.message });
    } else {
      return Response.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE /api/members/[id]:", error);
    return Response.json(
      { success: false, error: "Gagal menghapus anggota" },
      { status: 500 }
    );
  }
}