"use server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";

export type Admin = typeof admin.$inferSelect;

export const getAllAdmins = async () => {
  try {
    const admins = await db.select().from(admin);
    return admins;
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    return [];
  }
};

export const getAdminById = async (id: number) => {
  try {
    const [adminData] = await db.select().from(admin).where(eq(admin.id, id));
    return adminData;
  } catch (error) {
    console.error("Error in getAdminById:", error);
    return null;
  }
};

// Tambah Admin
export const addAdmin = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Hash password sebelum disimpan (implementasi sederhana)
  // Dalam produksi, gunakan library seperti bcrypt
  const hashedPassword = await hashPassword(password);

  await db.insert(admin).values({
    username,
    password: hashedPassword,
  });
};

// Edit Admin
export const updateAdmin = async (id: number, formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const updateData: Partial<Admin> = {
    username,
  };

  // Jika password diisi, hash dan tambahkan ke data update
  if (password) {
    const hashedPassword = await hashPassword(password);
    updateData.password = hashedPassword;
  }

  await db
    .update(admin)
    .set(updateData)
    ."use server";
    import { eq } from "drizzle-orm";
    import { db } from "@/lib/db";
    import { loan, member, book as bookSchema } from "@/lib/db/schema"; // Renamed import

    export type Loan = typeof loan.$inferSelect;

    export type DetailedLoan = Loan & {
      memberName: string;
      memberEmail: string;
      bookTitle: string;
      bookAuthor: string;
    };

    export const getAllLoans = async () => {
      try {
        const loans = await db
          .select({
            id: loan.id,
            memberId: loan.memberId,
            bookId: loan.bookId,
            loanDate: loan.loanDate,
            dueDate: loan.dueDate,
            returnDate: loan.returnDate,
            status: loan.status,
            fine: loan.fine,
            createdAt: loan.createdAt,
            memberName: member.name,
            memberEmail: member.email,
            bookTitle: bookSchema.title,
            bookAuthor: bookSchema.author,
          })
          .from(loan)
          .leftJoin(member, eq(loan.memberId, member.id))
          .leftJoin(bookSchema, eq(loan.bookId, bookSchema.id)); // Use renamed schema

        return loans;
      } catch (error) {
        console.error("Error in getAllLoans:", error);
        return [];
      }
    };

    export const getLoanById = async (id: number) => {
      try {
        const [loanData] = await db
          .select({
            id: loan.id,
            memberId: loan.memberId,
            bookId: loan.bookId,
            loanDate: loan.loanDate,
            dueDate: loan.dueDate,
            returnDate: loan.returnDate,
            status: loan.status,
            fine: loan.fine,
            createdAt: loan.createdAt,
            memberName: member.name,
            memberEmail: member.email,
            bookTitle: bookSchema.title,
            bookAuthor: bookSchema.author,
          })
          .from(loan)
          .leftJoin(member, eq(loan.memberId, member.id))
          .leftJoin(bookSchema, eq(loan.bookId, bookSchema.id))
          .where(eq(loan.id, id));

        return loanData;
      } catch (error) {
        console.error("Error in getLoanById:", error);
        return null;
      }
    };

    // Tambah Peminjaman
    export const addLoan = async (formData: FormData) => {
      const memberId = Number(formData.get("memberId"));
      const bookId = Number(formData.get("bookId"));
      const loanDate = formData.get("loanDate") as string;
      const dueDate = formData.get("dueDate") as string;

      try {
        // Use transaction for data consistency
        return await db.transaction(async (tx) => {
          // Get current book data
          const [bookData] = await tx
            .select()
            .from(bookSchema)
            .where(eq(bookSchema.id, bookId));

          if (!bookData || bookData.availableCopies <= 0) {
            throw new Error("Buku tidak tersedia untuk dipinjam");
          }

          // Update book stock
          await tx
            .update(bookSchema)
            .set({
              availableCopies: bookData.availableCopies - 1
            })
            .where(eq(bookSchema.id, bookId));

          // Create loan record
          const [newLoan] = await tx.insert(loan).values({
            memberId,
            bookId,
            loanDate,
            dueDate,
            status: "borrowed",
          }).returning();

          return newLoan;
        });
      } catch (error) {
        console.error("Error in addLoan:", error);
        throw new Error("Gagal menambahkan peminjaman");
      }
    };

    // Edit Peminjaman
    export const updateLoan = async (id: number, formData: FormData) => {
      const memberId = Number(formData.get("memberId"));
      const bookId = Number(formData.get("bookId"));
      const loanDate = formData.get("loanDate") as string;
      const dueDate = formData.get("dueDate") as string;
      const returnDate = formData.get("returnDate") as string | null;
      const status = formData.get("status") as string;
      const fine = formData.get("fine") as string;

      await db
        .update(loan)
        .set({
          memberId,
          bookId,
          loanDate,
          dueDate,
          returnDate: returnDate || null,
          status,
          fine: fine || "0",
        })
        .where(eq(loan.id, id));
    };

    // Hapus Peminjaman
    export const deleteLoan = async (
      id: number,
    ): Promise<{ success: boolean; message: string }> => {
      try {
        const [loanData] = await db.select().from(loan).where(eq(loan.id, id));
        if (!loanData) {
          return { success: false, message: "Peminjaman tidak ditemukan" };
        }

        // Only adjust stock if book was actually returned
        if (loanData.status === "returned") {
          await db.transaction(async (tx) => {
            const [bookData] = await tx
              .select({ availableCopies: bookSchema.availableCopies })
              .from(bookSchema)
              .where(eq(bookSchema.id, loanData.bookId));

            if (bookData) {
              await tx
                .update(bookSchema)
                .set({
                  availableCopies: bookData.availableCopies + 1
                })
                .where(eq(bookSchema.id, loanData.bookId));
            }
          });
        }

        await db.delete(loan).where(eq(loan.id, id));
        return { success: true, message: "Peminjaman berhasil dihapus" };
      } catch (error) {
        console.error("Error deleting loan:", error);
        return { success: false, message: "Gagal menghapus peminjaman" };
      }
    };

    // Fungsi untuk mengembalikan buku
    export const returnBook = async (id: number) => {
      try {
        return await db.transaction(async (tx) => {
          const [loanData] = await tx
            .select({
              id: loan.id,
              bookId: loan.bookId,
              status: loan.status
            })
            .from(loan)
            .where(eq(loan.id, id));

          if (!loanData) {
            throw new Error("Peminjaman tidak ditemukan");
          }

          if (loanData.status === "returned") {
            throw new Error("Buku sudah dikembalikan");
          }

          // Get current book data
          const [bookData] = await tx
            .select({ availableCopies: bookSchema.availableCopies })
            .from(bookSchema)
            .where(eq(bookSchema.id, loanData.bookId));

          if (!bookData) {
            throw new Error("Buku tidak ditemukan");
          }

          // Update book stock
          await tx
            .update(bookSchema)
            .set({
              availableCopies: bookData.availableCopies + 1
            })
            .where(eq(bookSchema.id, loanData.bookId));

          // Update loan status
          await tx
            .update(loan)
            .set({
              returnDate: new Date().toISOString().split('T')[0],
              status: "returned",
            })
            .where(eq(loan.id, id));

          return { success: true, message: "Buku berhasil dikembalikan" };
        });
      } catch (error) {
        console.error("Error returning book:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Gagal mengembalikan buku"
        };
      }
    };(eq(admin.id, id));
};

// Hapus Admin
export const deleteAdmin = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    await db.delete(admin).where(eq(admin.id, id));
    return { success: true, message: "Admin berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting admin:", error);
    return { success: false, message: "Gagal menghapus admin" };
  }
};

// Fungsi sederhana untuk hashing password (implementasi sederhana)
// Dalam produksi, gunakan bcrypt atau library hashing yang aman
const hashPassword = async (password: string): Promise<string> => {
  // Ini hanya implementasi sederhana untuk keperluan demo
  // Dalam produksi, gunakan library hashing yang aman seperti bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
