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
import { MultiSelectCategory } from "@/components/category/multi-select";
import { BookPlus, Edit } from "lucide-react";
import { getAllCategories } from "@/actions/categories";
import { toast } from "sonner";

interface BookFormProps {
  bookId?: number;
  initialData?: {
    title: string;
    author: string;
    publicationDate: string;
    totalCopies: number;
    availableCopies: number;
    categoryIds: number[];
  };
  triggerButton?: "add" | "edit";
  onSuccess?: () => void;
}

export default function BookForm({
  bookId,
  initialData,
  triggerButton = "add",
  onSuccess,
}: BookFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<
    { id: number; name: string; description?: string | null }[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publicationDate: "",
    totalCopies: "1",
    availableCopies: "1",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Gagal mengambil data kategori");
      }
    };

    fetchCategories();
  }, []);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      // Dialog opened - load initial data or reset to defaults
      if (initialData) {
        setFormData({
          title: initialData.title,
          author: initialData.author,
          publicationDate: initialData.publicationDate,
          totalCopies: initialData.totalCopies.toString(),
          availableCopies: initialData.availableCopies.toString(),
        });
        setSelectedCategoryIds(initialData.categoryIds);
      } else {
        // Reset to defaults for new book
        setFormData({
          title: "",
          author: "",
          publicationDate: "",
          totalCopies: "1",
          availableCopies: "1",
        });
        setSelectedCategoryIds([]);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul buku wajib diisi";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Pengarang buku wajib diisi";
    }

    if (!formData.publicationDate) {
      newErrors.publicationDate = "Tanggal terbit wajib diisi";
    }

    const totalCopies = Number(formData.totalCopies);
    if (isNaN(totalCopies) || totalCopies <= 0) {
      newErrors.totalCopies = "Jumlah total buku harus lebih dari 0";
    }

    const availableCopies = Number(formData.availableCopies);
    if (isNaN(availableCopies) || availableCopies < 0) {
      newErrors.availableCopies = "Jumlah buku tersedia tidak valid";
    }

    if (availableCopies > totalCopies) {
      newErrors.availableCopies =
        "Jumlah buku tersedia tidak boleh lebih dari total buku";
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
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.availableCopies),
        categoryIds: selectedCategoryIds,
      };

      let response;
      if (bookId) {
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          if (key !== "categoryIds") {
            formDataToSend.append(key, value.toString());
          }
        });
        formDataToSend.set("categoryIds", JSON.stringify(selectedCategoryIds));

        response = await fetch(`/api/books/${bookId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          if (key !== "categoryIds") {
            formDataToSend.append(key, value.toString());
          }
        });
        formDataToSend.set("categoryIds", JSON.stringify(selectedCategoryIds));

        response = await fetch("/api/books", {
          method: "POST",
          body: formDataToSend,
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          bookId
            ? "Buku berhasil diperbarui"
            : "Buku baru berhasil ditambahkan",
        );
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error ||
            (bookId ? "Gagal memperbarui buku" : "Gagal menambahkan buku"),
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan buku");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {triggerButton === "add" ? (
            <>
              Tambah Buku <BookPlus />
            </>
          ) : (
            <>
              Edit <Edit />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{bookId ? "Edit Buku" : "Tambah Buku Baru"}</DialogTitle>
          <DialogDescription>
            {bookId
              ? "Edit informasi buku."
              : "Tambah buku baru ke perpustakaan Anda."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Masukkan judul buku"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="author">Pengarang *</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Masukkan nama pengarang"
              className={errors.author ? "border-red-500" : ""}
            />
            {errors.author && (
              <p className="text-red-500 text-sm">{errors.author}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="publicationDate">Tanggal Terbit *</Label>
            <Input
              id="publicationDate"
              name="publicationDate"
              type="date"
              value={formData.publicationDate}
              onChange={handleChange}
              className={errors.publicationDate ? "border-red-500" : ""}
            />
            {errors.publicationDate && (
              <p className="text-red-500 text-sm">{errors.publicationDate}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="totalCopies">Total Buku *</Label>
              <Input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={handleChange}
                className={errors.totalCopies ? "border-red-500" : ""}
              />
              {errors.totalCopies && (
                <p className="text-red-500 text-sm">{errors.totalCopies}</p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="availableCopies">Buku Tersedia *</Label>
              <Input
                id="availableCopies"
                name="availableCopies"
                type="number"
                min="0"
                value={formData.availableCopies}
                onChange={handleChange}
                className={errors.availableCopies ? "border-red-500" : ""}
              />
              {errors.availableCopies && (
                <p className="text-red-500 text-sm">{errors.availableCopies}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <MultiSelectCategory
              allCategories={categories}
              selectedCategoryIds={selectedCategoryIds}
              onSelectionChange={setSelectedCategoryIds}
              label="Kategori *"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>
              {bookId ? "Simpan Perubahan" : "Tambah Buku"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
