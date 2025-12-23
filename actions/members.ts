"use server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, loan } from "@/lib/db/schema";

export type Member = typeof member.$inferSelect;

export const getAllMembers = async () => {
  try {
    const members = await db.select().from(member);
    return members;
  } catch (error) {
    console.error("Error in getAllMembers:", error);
    return [];
  }
};

export const getMemberById = async (id: number) => {
  try {
    const [memberData] = await db.select().from(member).where(eq(member.id, id));
    return memberData;
  } catch (error) {
    console.error("Error in getMemberById:", error);
    return null;
  }
};

// Tambah Anggota
export const addMember = async (formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const status = formData.get("status") as string || "active";

  await db.insert(member).values({
    name,
    email,
    phone,
    address,
    status,
  });
};

// Edit Anggota
export const updateMember = async (id: number, formData: FormData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const status = formData.get("status") as string || "active";

  await db
    .update(member)
    .set({
      name,
      email,
      phone,
      address,
      status,
    })
    .where(eq(member.id, id));
};

// Hapus Anggota
export const deleteMember = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const loans = await db.select().from(loan).where(eq(loan.memberId, id));

  if (loans.length > 0) {
    return { success: false, message: "Anggota memiliki peminjaman aktif" };
  }

  await db.delete(member).where(eq(member.id, id));

  return { success: true, message: "Anggota berhasil dihapus" };
};