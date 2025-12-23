"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { getAllMembers } from "@/actions/members";
import { getAllbooks } from "@/actions/books";
import { toast } from "sonner";

interface LoanFormProps {
  loanId?: number;
  initialData?: {
    memberId: number;
    bookId: number;
    loanDate: string;
    dueDate: string;
    returnDate?: string | null;
    status: string;
    fine?: string | null;
  };
  triggerButton?: "add" | "edit";
  onSuccess?: () => void;
}

export default function LoanForm({
  loanId,
  initialData,
  triggerButton = "add",
  onSuccess,
}: LoanFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<{ id: number; name: string }[]>([]);
  const [books, setBooks] = useState<
    { id: number; title: string; author: string; availableCopies: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    memberId: "",
    bookId: "",
    loanDate: "",
    dueDate: "",
    returnDate: "",
    status: "borrowed",
    fine: "0",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch members and books once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersData, booksData] = await Promise.all([
          getAllMembers(),
          getAllbooks(),
        ]);

        // Format data to only include necessary fields
        const formattedMembers = membersData.map((member) => ({
          id: member.id,
          name: member.name,
        }));

        const formattedBooks = booksData.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          availableCopies: book.availableCopies,
        }));

        setMembers(formattedMembers);
        setBooks(formattedBooks);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal mengambil data anggota dan buku");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Dialog opened - load initial data or reset to defaults
      if (initialData) {
        setFormData({
          memberId: initialData.memberId.toString(),
          bookId: initialData.bookId.toString(),
          loanDate: initialData.loanDate,
          dueDate: initialData.dueDate,
          returnDate: initialData.returnDate || "",
          status: initialData.status,
          fine: initialData.fine || "0",
        });
      } else {
        // Reset to defaults for new loan
        const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Default 7 days due
        const dueDateStr = dueDate.toISOString().split("T")[0];

        setFormData({
          memberId: "",
          bookId: "",
          loanDate: today,
          dueDate: dueDateStr,
          returnDate: "",
          status: "borrowed",
          fine: "0",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.memberId) {
      newErrors.memberId = "Anggota wajib dipilih";
    }

    if (!formData.bookId) {
      newErrors.bookId = "Buku wajib dipilih";
    }

    if (!formData.loanDate) {
      newErrors.loanDate = "Tanggal peminjaman wajib diisi";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Tanggal jatuh tempo wajib diisi";
    }

    // Check if book is available when adding new loan
    if (!loanId) {
      const selectedBook = books.find(
        (book) => book.id === Number(formData.bookId),
      );
      if (selectedBook && selectedBook.availableCopies <= 0) {
        newErrors.bookId = "Buku tidak tersedia untuk dipinjam";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        memberId: Number(formData.memberId),
        bookId: Number(formData.bookId),
      };

      let response;
      if (loanId) {
        // Update existing loan
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          formDataToSend.append(key, value.toString());
        });

        response = await fetch(`/api/loans/${loanId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        // Create new loan
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          formDataToSend.append(key, value.toString());
        });

        response = await fetch("/api/loans", {
          method: "POST",
          body: formDataToSend,
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          loanId
            ? "Peminjaman berhasil diperbarui"
            : "Peminjaman baru berhasil ditambahkan",
        );
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error ||
            (loanId
              ? "Gagal memperbarui peminjaman"
              : "Gagal menambahkan peminjaman"),
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan peminjaman");
    }
  };

  if (loading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size={"sm"} disabled>
            {triggerButton === "add" ? (
              <>
                Tambah Peminjaman <Plus />
              </>
            ) : (
              <>
                <Edit />
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {loanId ? "Edit Peminjaman" : "Tambah Peminjaman Baru"}
            </DialogTitle>
            <DialogDescription>Memuat data...</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          {triggerButton === "add" ? (
            <>
              Tambah Peminjaman <Plus />
            </>
          ) : (
            <>
              <Edit />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {loanId ? "Edit Peminjaman" : "Tambah Peminjaman Baru"}
          </DialogTitle>
          <DialogDescription>
            {loanId
              ? "Edit informasi peminjaman."
              : "Tambah peminjaman baru ke sistem perpustakaan Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="memberId">Anggota *</Label>
            <select
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.memberId ? "border-red-500" : ""}`}
            >
              <option value="">Pilih anggota</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="text-red-500 text-sm">{errors.memberId}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="bookId">Buku *</Label>
            <select
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              className={`w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.bookId ? "border-red-500" : ""}`}
            >
              <option value="">Pilih buku</option>
              {books
                .filter((book) => loanId || book.availableCopies > 0) // Only show available books for new loans
                .map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.author}) - Tersedia:{" "}
                    {book.availableCopies}
                  </option>
                ))}
            </select>
            {errors.bookId && (
              <p className="text-red-500 text-sm">{errors.bookId}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="loanDate">Tanggal Peminjaman *</Label>
            <Input
              id="loanDate"
              name="loanDate"
              type="date"
              value={formData.loanDate}
              onChange={handleChange}
              className={errors.loanDate ? "border-red-500" : ""}
            />
            {errors.loanDate && (
              <p className="text-red-500 text-sm">{errors.loanDate}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="dueDate">Tanggal Jatuh Tempo *</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className={errors.dueDate ? "border-red-500" : ""}
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="borrowed">Dipinjam</option>
              <option value="returned">Dikembalikan</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="returnDate">Tanggal Pengembalian</Label>
            <Input
              id="returnDate"
              name="returnDate"
              type="date"
              value={formData.returnDate}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="fine">Denda (Rp)</Label>
            <Input
              id="fine"
              name="fine"
              type="number"
              min="0"
              value={formData.fine}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit">
              {loanId ? "Simpan Perubahan" : "Tambah Peminjaman"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
