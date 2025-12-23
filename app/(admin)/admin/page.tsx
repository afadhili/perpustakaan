"use client";
import { Admin, deleteAdmin, getAllAdmins } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit3, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminForm from "@/components/admin/admin-form";

export default function Admins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ambil data admin saat pertama kali
  useEffect(() => {
    const fetchData = async () => {
      const adminsData = await getAllAdmins();
      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
    };
    fetchData();
  }, []);

  // Terapkan pencarian
  useEffect(() => {
    const setFiltered = () => {
      const results = admins.filter(
        (admin) =>
          admin.username.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredAdmins(results);
      setCurrentPage(1);
    };
    setFiltered();
  }, [searchTerm, admins]);

  // Hitung total halaman
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAdmins = filteredAdmins.slice(
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
    if (!confirm("Apakah Anda yakin ingin menghapus admin ini?")) return;
    try {
      const result = await deleteAdmin(id);
      if (result.success) {
        toast.success(result.message);
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
        setFilteredAdmins((prevAdmins) =>
          prevAdmins.filter((admin) => admin.id !== id),
        );
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal menghapus admin");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 px-8 md:px-16 lg:px-20">
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-lg md:text-xl lg:text-3xl">
            Daftar Admin (
            <span className="text-primary">{filteredAdmins.length}</span>)
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Daftar admin yang memiliki akses ke sistem perpustakaan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <AdminForm triggerButton="add" onSuccess={() => {
            // Refresh data setelah menambah admin
            const fetchData = async () => {
              const adminsData = await getAllAdmins();
              setAdmins(adminsData);
              setFilteredAdmins(adminsData);
            };
            fetchData();
          }} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 md:px-16 lg:px-20 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan username..."
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
              <TableHead>Username</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentAdmins.length > 0 ? (
              currentAdmins.map((admin, index) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <AdminForm
                      adminId={admin.id}
                      initialData={{
                        username: admin.username,
                      }}
                      triggerButton="edit"
                      onSuccess={() => {
                        // Refresh data setelah mengedit admin
                        const fetchData = async () => {
                          const adminsData = await getAllAdmins();
                          setAdmins(adminsData);
                          setFilteredAdmins(adminsData);
                        };
                        fetchData();
                      }}
                    />
                    <Button
                      onClick={() => handleDelete(admin.id)}
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
                  colSpan={4}
                  className="text-center text-muted-foreground py-4"
                >
                  Tidak ada admin ditemukan.
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