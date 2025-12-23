"use server";
import { db } from "@/lib/db";
import { book, loan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Member } from "./members";
import { Book } from "./books";

export type Loan = typeof loan.$inferSelect & {
  member: Member;
  book: Book;
};

export const getAllLoans = async () => {
  try {
    const loans = await db.query.loan.findMany({
      with: {
        member: true,
        book: true,
      },
    });
    return loans;
  } catch (error) {
    console.error("Error in getAllLoans:", error);
    return [];
  }
};

export const getLoanById = async (id: number) => {
  try {
    const loanData = await db.query.loan.findFirst({
      with: {
        member: true,
        book: true,
      },
      where: eq(loan.id, id),
    });

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
    return await db.transaction(async (tx) => {
      const [bookData] = await tx
        .select()
        .from(book)
        .where(eq(book.id, bookId));

      if (!bookData || bookData.availableCopies <= 0) {
        throw new Error("Buku tidak tersedia untuk dipinjam");
      }

      // Update book stock
      await tx
        .update(book)
        .set({
          availableCopies: bookData.availableCopies - 1,
        })
        .where(eq(book.id, bookId));

      // Create loan record
      const [newLoan] = await tx
        .insert(loan)
        .values({
          memberId,
          bookId,
          loanDate,
          dueDate,
          status: "borrowed",
        })
        .returning();

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
  const status = formData.get("status") as Loan["status"];
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
          .select({ availableCopies: book.availableCopies })
          .from(book)
          .where(eq(book.id, loanData.bookId));

        if (bookData) {
          await tx
            .update(book)
            .set({
              availableCopies: bookData.availableCopies + 1,
            })
            .where(eq(book.id, loanData.bookId));
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
          status: loan.status,
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
        .select({ availableCopies: book.availableCopies })
        .from(book)
        .where(eq(book.id, loanData.bookId));

      if (!bookData) {
        throw new Error("Buku tidak ditemukan");
      }

      // Update book stock
      await tx
        .update(book)
        .set({
          availableCopies: bookData.availableCopies + 1,
        })
        .where(eq(book.id, loanData.bookId));

      // Update loan status
      await tx
        .update(loan)
        .set({
          returnDate: new Date().toISOString().split("T")[0],
          status: "returned",
        })
        .where(eq(loan.id, id));

      return { success: true, message: "Buku berhasil dikembalikan" };
    });
  } catch (error) {
    console.error("Error returning book:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mengembalikan buku",
    };
  }
};
