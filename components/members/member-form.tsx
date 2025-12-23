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
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface MemberFormProps {
  memberId?: number;
  initialData?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
  };
  triggerButton?: "add" | "edit";
  onSuccess?: () => void;
}

export default function MemberForm({
  memberId,
  initialData,
  triggerButton = "add",
  onSuccess,
}: MemberFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    status: initialData?.status || "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama anggota wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email anggota wajib diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi";
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
        status: formData.status || "active",
      };

      let response;
      if (memberId) {
        // Update existing member
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });

        response = await fetch(`/api/members/${memberId}`, {
          method: "PUT",
          body: formDataToSend,
        });
      } else {
        // Create new member
        const formDataToSend = new FormData();
        Object.entries(submitData).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });

        response = await fetch("/api/members", {
          method: "POST",
          body: formDataToSend,
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          memberId
            ? "Anggota berhasil diperbarui"
            : "Anggota baru berhasil ditambahkan",
        );
        setIsOpen(false);
        onSuccess?.();
      } else {
        toast.error(
          result.error ||
            (memberId
              ? "Gagal memperbarui anggota"
              : "Gagal menambahkan anggota"),
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat menyimpan anggota");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          {triggerButton === "add" ? (
            <>
              Tambah Anggota <UserPlus />
            </>
          ) : (
            <>
              Edit <Edit3 />
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {memberId ? "Edit Anggota" : "Tambah Anggota Baru"}
          </DialogTitle>
          <DialogDescription>
            {memberId
              ? "Edit informasi anggota."
              : "Tambah anggota baru ke perpustakaan Anda."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap anggota"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan alamat email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="phone">Nomor Telepon *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Masukkan nomor telepon"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="address">Alamat *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button type="submit">
              {memberId ? "Simpan Perubahan" : "Tambah Anggota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
