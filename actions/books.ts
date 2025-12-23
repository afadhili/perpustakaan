"use server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { book, loan, bookCategory, category } from "@/lib/db/schema";

export type Book = typeof book.$inferSelect;

export type DetailedBook = Book & {
  categoryIds: number[];
  categories: {
    id: number;
    name: string;
    description: string | null;
  }[];
};

export const getAllbooks = async () => {
  try {
    // Ambil semua buku dengan kategorinya
    const books = await db
      .select({
        id: book.id,
        title: book.title,
        author: book.author,
        publicationDate: book.publicationDate,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        createdAt: book.createdAt,
        categoryId: category.id,
        categoryName: category.name,
        categoryDescription: category.description,
      })
      .from(book)
      .leftJoin(bookCategory, eq(book.id, bookCategory.bookId))
      .leftJoin(category, eq(bookCategory.categoryId, category.id))
      .orderBy(book.id);

    // Kelompokkan hasil berdasarkan buku
    const groupedBooks: Record<number, DetailedBook> = {};

    books.forEach(row => {
      if (!groupedBooks[row.id]) {
        groupedBooks[row.id] = {
          id: row.id,
          title: row.title,
          author: row.author,
          publicationDate: row.publicationDate,
          totalCopies: row.totalCopies,
          availableCopies: row.availableCopies,
          createdAt: row.createdAt,
          categoryIds: [],
          categories: [],
        };
      }

      if (row.categoryId !== null) {
        const existingCat = groupedBooks[row.id].categories.find(cat => cat.id === row.categoryId);
        if (!existingCat) {
          groupedBooks[row.id].categories.push({
            id: row.categoryId,
            name: row.categoryName,
            description: row.categoryDescription,
          });
          groupedBooks[row.id].categoryIds.push(row.categoryId);
        }
      }
    });

    return Object.values(groupedBooks);
  } catch (error) {
    console.error("Error in getAllbooks:", error);
    return [];
  }
};

export const getBookById = async (id: number) => {
  try {
    const bookData = await db
      .select({
        id: book.id,
        title: book.title,
        author: book.author,
        publicationDate: book.publicationDate,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        createdAt: book.createdAt,
        categoryId: category.id,
        categoryName: category.name,
        categoryDescription: category.description,
      })
      .from(book)
      .leftJoin(bookCategory, eq(book.id, bookCategory.bookId))
      .leftJoin(category, eq(bookCategory.categoryId, category.id))
      .where(eq(book.id, id));

    if (bookData.length === 0) {
      return null;
    }

    const detailedBook: DetailedBook = {
      id: bookData[0].id,
      title: bookData[0].title,
      author: bookData[0].author,
      publicationDate: bookData[0].publicationDate,
      totalCopies: bookData[0].totalCopies,
      availableCopies: bookData[0].availableCopies,
      createdAt: bookData[0].createdAt,
      categoryIds: [],
      categories: [],
    };

    bookData.forEach(row => {
      if (row.categoryId !== null) {
        const existingCat = detailedBook.categories.find(cat => cat.id === row.categoryId);
        if (!existingCat) {
          detailedBook.categories.push({
            id: row.categoryId,
            name: row.categoryName,
            description: row.categoryDescription,
          });
          detailedBook.categoryIds.push(row.categoryId);
        }
      }
    });

    return detailedBook;
  } catch (error) {
    console.error("Error in getBookById:", error);
    return null;
  }
};

// Tambah Buku
export const addBook = async (formData: FormData) => {
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const publicationDate = formData.get("publicationDate") as string;
  const totalCopies = Number(formData.get("totalCopies"));
  const availableCopies = Number(formData.get("availableCopies"));

  const newBook = await db.insert(book).values({
    title,
    author,
    publicationDate,
    totalCopies,
    availableCopies,
  }).returning();

  // Ambil kategori dari form data jika ada
  const categoryIdsString = formData.get('categoryIds') as string | null;
  if (categoryIdsString) {
    const categoryIds = JSON.parse(categoryIdsString) as number[];

    // Tambahkan relasi buku-kategori
    if (categoryIds.length > 0) {
      const relationsToInsert = categoryIds.map(categoryId => ({
        bookId: newBook[0].id,
        categoryId: categoryId
      }));

      await db.insert(bookCategory).values(relationsToInsert);
    }
  }

  return newBook[0];
};

// Edit Buku
export const updateBook = async (id: number, formData: FormData) => {
  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const publicationDate = formData.get("publicationDate") as string;
  const totalCopies = Number(formData.get("totalCopies"));
  const availableCopies = Number(formData.get("availableCopies"));

  await db
    .update(book)
    .set({
      title,
      author,
      publicationDate,
      totalCopies,
      availableCopies,
    })
    .where(eq(book.id, id));

  // Ambil kategori dari form data dan update relasi
  const categoryIdsString = formData.get('categoryIds') as string | null;
  if (categoryIdsString) {
    const categoryIds = JSON.parse(categoryIdsString) as number[];

    // Hapus semua relasi kategori sebelumnya
    await db.delete(bookCategory).where(eq(bookCategory.bookId, id));

    // Tambahkan relasi kategori yang baru
    if (categoryIds.length > 0) {
      const relationsToInsert = categoryIds.map(categoryId => ({
        bookId: id,
        categoryId: categoryId
      }));

      await db.insert(bookCategory).values(relationsToInsert);
    }
  }
};

// Hapus Buku
export const deleteBook = async (
  id: number,
): Promise<{ success: boolean; message: string }> => {
  const loans = await db.select().from(loan).where(eq(loan.bookId, id));

  if (loans.length > 0) {
    return { success: false, message: "Buku sedang dipinjam" };
  }

  await db.delete(book).where(eq(book.id, id));

  return { success: true, message: "Buku berhasil dihapus" };
};

// Fungsi untuk menghapus relasi kategori dari buku
export const removeBookCategories = async (bookId: number) => {
  await db.delete(bookCategory).where(eq(bookCategory.bookId, bookId));
};

// Fungsi untuk menambahkan kategori ke buku
export const addBookCategories = async (bookId: number, categoryIds: number[]) => {
  const relationsToInsert = categoryIds.map(categoryId => ({
    bookId,
    categoryId
  }));

  await db.insert(bookCategory).values(relationsToInsert);
};
