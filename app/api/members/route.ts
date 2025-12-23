import { NextRequest } from "next/server";
import { 
  getAllMembers, 
  addMember, 
  updateMember, 
  deleteMember 
} from "@/actions/members";

export async function GET(request: NextRequest) {
  try {
    const members = await getAllMembers();
    return Response.json({ success: true, data: members });
  } catch (error) {
    console.error("Error in GET /api/members:", error);
    return Response.json(
      { success: false, error: "Gagal mengambil anggota" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    await addMember(formData);
    
    return Response.json({ success: true, message: "Anggota berhasil ditambahkan" });
  } catch (error) {
    console.error("Error in POST /api/members:", error);
    return Response.json(
      { success: false, error: "Gagal menambahkan anggota" },
      { status: 500 }
    );
  }
}