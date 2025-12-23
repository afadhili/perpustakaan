"use client";
import { Member, deleteMember, getAllMembers } from "@/actions/members";
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
import MemberForm from "@/components/members/member-form";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Ambil data anggota saat pertama kali
  useEffect(() => {
    const fetchData = async () => {
      const membersData = await getAllMembers();
      setMembers(membersData);
      setFilteredMembers(membersData);
    };
    fetchData();
  }, []);

  // Terapkan pencarian
  useEffect(() => {
    const setFiltered = () => {
      const results = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredMembers(results);
      setCurrentPage(1);
    };
    setFiltered();
  }, [searchTerm, members]);

  // Hitung total halaman
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(
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
    if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
    try {
      const result = await deleteMember(id);
      if (result.success) {
        toast.success(result.message);
        setMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== id),
        );
        setFilteredMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== id),
        );
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Gagal menghapus anggota");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 px-8 md:px-16 lg:px-20">
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-lg md:text-xl lg:text-3xl">
            Daftar Anggota (
            <span className="text-primary">{filteredMembers.length}</span>)
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Daftar anggota yang terdaftar di perpustakaan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <MemberForm
            triggerButton="add"
            onSuccess={() => {
              // Refresh data setelah menambah anggota
              const fetchData = async () => {
                const membersData = await getAllMembers();
                setMembers(membersData);
                setFilteredMembers(membersData);
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
          placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
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
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Nomor Telepon</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMembers.length > 0 ? (
              currentMembers.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone}</TableCell>
                  <TableCell>{member.address}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {member.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <MemberForm
                      memberId={member.id}
                      initialData={{
                        name: member.name,
                        email: member.email,
                        phone: member.phone,
                        address: member.address,
                        status: member.status,
                      }}
                      triggerButton="edit"
                      onSuccess={() => {
                        // Refresh data setelah mengedit anggota
                        const fetchData = async () => {
                          const membersData = await getAllMembers();
                          setMembers(membersData);
                          setFilteredMembers(membersData);
                        };
                        fetchData();
                      }}
                    />
                    <Button
                      onClick={() => handleDelete(member.id)}
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
                  Tidak ada anggota ditemukan.
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
