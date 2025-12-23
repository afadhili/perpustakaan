"use client";
import { Loan, deleteLoan, getAllLoans, returnBook } from "@/actions/loans";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import LoanForm from "@/components/loans/loan-form";

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Fetch data with loading state
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const loansData = await getAllLoans();
        setLoans(loansData);
        setFilteredLoans(loansData);
      } catch (error) {
        toast.error("Gagal memuat data peminjaman");
        console.error("Fetch loans error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const filtered = loans.filter(
      (loan) =>
        loan.member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.status.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredLoans(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchTerm, loans]);

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLoans.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLoans = filteredLoans.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus peminjaman ini?")) return;

    setActionLoading(id);
    try {
      const result = await deleteLoan(id);
      if (result.success) {
        toast.success(result.message);
        setLoans((prev) => prev.filter((loan) => loan.id !== id));
        setFilteredLoans((prev) => prev.filter((loan) => loan.id !== id));
      } else {
        toast.error(result.message || "Gagal menghapus peminjaman");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
      console.error("Delete loan error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReturnBook = async (id: number) => {
    setActionLoading(id);
    try {
      const result = await returnBook(id);
      if (result.success) {
        toast.success(result.message);
        // Optimistic update
        setLoans((prev) =>
          prev.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  status: "returned",
                  returnDate: new Date().toISOString().split("T")[0],
                }
              : loan,
          ),
        );
        setFilteredLoans((prev) =>
          prev.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  status: "returned",
                  returnDate: new Date().toISOString().split("T")[0],
                }
              : loan,
          ),
        );
      } else {
        toast.error(result.message || "Gagal mengembalikan buku");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengembalikan buku");
      console.error("Return book error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const loansData = await getAllLoans();
      setLoans(loansData);
      setFilteredLoans(loansData);
      toast.success("Data berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui data");
      console.error("Refresh data error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Daftar Peminjaman</h1>
          <p className="text-muted-foreground">
            Total:{" "}
            <span className="font-medium text-primary">
              {filteredLoans.length}
            </span>{" "}
            item
          </p>
        </div>
        <LoanForm triggerButton="add" onSuccess={refreshData} />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan nama anggota, judul buku, atau status..."
          className="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Nama Anggota</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Judul Buku</TableHead>
              <TableHead className="hidden lg:table-cell">
                Tanggal Pinjam
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Jatuh Tempo
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Denda</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLoans.length > 0 ? (
              currentLoans.map((loan, index) => (
                <TableRow key={loan.id} className="hover:bg-muted/50">
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {loan.member.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {loan.member.email}
                  </TableCell>
                  <TableCell>{loan.book.title}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {loan.loanDate}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {loan.dueDate}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        loan.status === "borrowed"
                          ? "bg-yellow-100 text-yellow-800"
                          : loan.status === "returned"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {loan.status === "borrowed"
                        ? "Dipinjam"
                        : loan.status === "returned"
                          ? "Dikembalikan"
                          : "Terlambat"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {Number(loan.fine).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {loan.status === "borrowed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-700"
                          onClick={() => handleReturnBook(loan.id)}
                          disabled={actionLoading === loan.id}
                        >
                          {actionLoading === loan.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Return"
                          )}
                        </Button>
                      )}
                      <LoanForm
                        loanId={loan.id}
                        initialData={{
                          memberId: loan.memberId,
                          bookId: loan.bookId,
                          loanDate: loan.loanDate,
                          dueDate: loan.dueDate,
                          returnDate: loan.returnDate || "",
                          status: loan.status,
                          fine: loan.fine,
                        }}
                        triggerButton="edit"
                        onSuccess={refreshData}
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(loan.id)}
                        disabled={actionLoading === loan.id}
                      >
                        {actionLoading === loan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchTerm
                    ? "Tidak ada hasil pencarian"
                    : "Belum ada data peminjaman"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between py-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {currentLoans.length} dari {filteredLoans.length} item
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="rows" className="text-sm text-muted-foreground">
              Baris per halaman:
            </label>
            <select
              id="rows"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-muted-foreground min-w-20 text-center">
              Halaman {currentPage} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
