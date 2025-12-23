"use client";

import { useState } from "react";
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
import { UserPlus, Edit } from "lucide-react";
import { toast } from "sonner";

interface AdminFormProps {
  adminId?: number;
  initialData?: {
    username: string;
  };
  triggerButton?: "add" | "edit";
  onSuccess?: () => void;
}

export default function AdminForm({
  adminId,
  initialData,
  triggerButton = "add",
  onSuccess
}: AdminFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: initialData?.username || "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    }

    if (!adminId && !formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
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
      };

      let response;
      if (adminId) {
        // Update existing admin (password is optional for updates)
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          if (key !== "password" || value.trim() !== "") {
            formDataToSend.append(key, value);
          }
        });

        response = await fetch(`/api/admins/${adminId}`, {
          method: 'PUT',
          body: formDataToSend
        });
      } else {
        // Create new admin
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });

        response = await fetch('/api/admins', {
          method: 'POST',
          body: formDataToSend
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(adminId ? "Admin berhasil diperbarui" : "Admin baru berhasil ditambahkan");
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || (adminId ? "Gagal memperbarui admin" : "Gagal menambahkan admin"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan admin");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {triggerButton === "add" ? (
            <>
              Tambah Admin <UserPlus />
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
          <DialogTitle>
            {adminId ? "Edit Admin" : "Tambah Admin Baru"}
          </DialogTitle>
          <DialogDescription>
            {adminId
              ? "Edit informasi admin."
              : "Tambah admin baru ke sistem perpustakaan Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username admin"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          {!adminId && (
            <div className="grid gap-3">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
          )}

          {adminId && (
            <div className="grid gap-3">
              <Label htmlFor="password">Password Baru (opsional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan password baru (kosongkan jika tidak ingin mengubah)"
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit">
              {adminId ? "Simpan Perubahan" : "Tambah Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}