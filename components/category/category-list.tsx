"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { CategoryForm } from "./category-form";

interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        const result = await response.json();

        if (result.success) {
          setCategories(result.data || []);
          setFilteredCategories(result.data || []);
        } else {
          toast.error("Gagal mengambil data kategori");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Terjadi kesalahan saat mengambil data kategori");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Apply search
  useEffect(() => {
    const setFiltered = () => {
      const results = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
      setFilteredCategories(results);
      setCurrentPage(1);
    };
    setFiltered();
  }, [searchTerm, categories]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handler for changing page
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSave = async (
    category: Omit<Category, "id"> | Partial<Category>,
  ) => {
    try {
      let response;

      if (editingCategory) {
        // Update existing category
        response = await fetch(`/api/category/${editingCategory.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        });
      } else {
        // Add new category
        response = await fetch("/api/category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          editingCategory
            ? "Kategori berhasil diperbarui"
            : "Kategori baru berhasil ditambahkan",
        );

        // Update local state
        if (editingCategory) {
          setCategories(
            categories.map((cat) =>
              cat.id === editingCategory.id
                ? { ...cat, ...category, id: editingCategory.id }
                : cat,
            ),
          );
        } else {
          setCategories([
            ...categories,
            { ...result.data, id: result.data.id },
          ]);
        }

        setEditingCategory(null);
        setIsDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal menyimpan kategori");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Terjadi kesalahan saat menyimpan kategori");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (id: number) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (categoryToDelete === null) return;

    try {
      const response = await fetch(`/api/category/${categoryToDelete}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Kategori berhasil dihapus");
        setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
        setFilteredCategories(
          filteredCategories.filter((cat) => cat.id !== categoryToDelete),
        );
        setCategoryToDelete(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(result.error || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Terjadi kesalahan saat menghapus kategori");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading kategori...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 px-8 md:px-16 lg:px-20">
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-lg md:text-xl lg:text-3xl">
            Daftar Kategori (
            <span className="text-primary">{filteredCategories.length}</span>)
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Daftar kategori buku yang tersedia di perpustakaan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                Tambah Kategori <Plus className="ml-1 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Edit informasi kategori."
                    : "Tambah kategori baru untuk buku-buku Anda."}
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                initialData={editingCategory || undefined}
                onSave={handleSave}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 md:px-16 lg:px-20 mb-4">
        <Input
          type="text"
          placeholder="Cari berdasarkan nama atau deskripsi..."
          className="w-full md:w-80"
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
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-20">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCategories.length > 0 ? (
              currentCategories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      Edit <Edit className="ml-1 h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteConfirm(category.id)}
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
                  Tidak ada kategori ditemukan.
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

      {/* Dialog for confirming deletion */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
