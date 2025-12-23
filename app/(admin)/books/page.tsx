"use client";
import { DetailedBook, deleteBook, getAllbooks } from "@/actions/books";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BookForm from "@/components/books/book-form";

export default function Books() {
  const [books, setBooks] = useState<DetailedBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<DetailedBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ambil data buku saat pertama kali
  useEffect(() => {
    const fetchData = async () => {
      const booksData = await getAllbooks();
      setBooks(booksData);
      setFilteredBooks(booksData);
    };
    fetchData();
  }, []);

  // Terapkan pencarian
  useEffect(() => {
    const setFiltered = () => {
      const results = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.categories.some((cat) =>
            cat?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
      setFilteredBooks(results);
      setCurrentPage(1);
    };
    setFiltered();
  }, [searchTerm, books]);

  // Hitung total halaman
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBooks = filteredBooks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handler untuk mengubah halaman
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus buku ini?")) return;
    try {
      const { success, message } = await deleteBook(id);
      if (success) {
        toast.success(message);
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
        setFilteredBooks((prevBooks) =>
          prevBooks.filter((book) => book.id !== id),
        );
      } else {
        toast.error(message);
      }
    } catch {
      toast.error("Gagal menghapus buku");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 px-8 md:px-16 lg:px-20">
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-lg md:text-xl lg:text-3xl">
            Daftar Buku (
            <span className="text-primary">{filteredBooks.length}</span>)
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Daftar buku yang tersedia di perpustakaan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <BookForm
            triggerButton="add"
            onSuccess={() => {
              // Refresh data setelah menambah buku
              const fetchData = async () => {
                const booksData = await getAllbooks();
                setBooks(booksData);
                setFilteredBooks(booksData);
              };
              fetchData();
            }}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 md:px-16 lg:px-20 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan judul, pengarang, atau kategori..."
          className="w-full md:w-80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="px-8 md:px-16 lg:px-20">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Pengarang</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tahun Terbit</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBooks.length > 0 ? (
              currentBooks.map((book, index) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    {book.categories.length > 0
                      ? book.categories.map((cat) => cat.name).join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>{book.publicationDate}</TableCell>
                  <TableCell>
                    {book.totalCopies} ({book.availableCopies} tersedia)
                  </TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <BookForm
                      bookId={book.id}
                      initialData={{
                        title: book.title,
                        author: book.author,
                        publicationDate: book.publicationDate,
                        totalCopies: book.totalCopies,
                        availableCopies: book.availableCopies,
                        categoryIds: book.categoryIds,
                      }}
                      triggerButton="edit"
                      onSuccess={() => {
                        // Refresh data setelah mengedit buku
                        const fetchData = async () => {
                          const booksData = await getAllbooks();
                          setBooks(booksData);
                          setFilteredBooks(booksData);
                        };
                        fetchData();
                      }}
                    />
                    <Button
                      onClick={() => handleDelete(book.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Hapus <Trash className="ml-1 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-4"
                >
                  Tidak ada buku ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-20 py-6">
        {/* Items per page selector */}
        <div className="mb-4 md:mb-0">
          <label className="text-sm text-muted-foreground mr-2">
            Tampilkan:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Pagination navigation */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
