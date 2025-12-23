"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Category } from "@/actions/categories";

interface CategoryFormProps {
  initialData?: {
    id?: number;
    name: string;
    description?: string | null;
  };
  onSave: (data: Omit<Category, "id"> | Partial<Category>) => void;
  onCancel: () => void;
}

export function CategoryForm({
  initialData,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Nama kategori wajib diisi";
    }
    if (name.length > 100) {
      newErrors.name = "Nama kategori tidak boleh lebih dari 100 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSave({ name, description: description || null });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Kategori *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama kategori"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Masukkan deskripsi kategori (opsional)"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {initialData ? "Simpan Perubahan" : "Tambah Kategori"}
        </Button>
      </div>
    </form>
  );
}
