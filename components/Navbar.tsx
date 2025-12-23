"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import SignOutButton from "./sign-out-button";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import { Book, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/members", label: "Anggota" },
  { href: "/categories", label: "Kategori" },
  { href: "/books", label: "Buku" },
  { href: "/loans", label: "Peminjaman" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-background border-b border-border shadow-sm flex items-center justify-between px-8 py-2">
      <Button variant="secondary" asChild>
        <Link href="/">
          <Book /> Perpustakaan - Admin
        </Link>
      </Button>
      <div className="hidden lg:flex items-center gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            className="hover:underline hover:opacity-80 duration-300 text-sm hover:text-primary"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div
        className={cn(
          "z-10 duration-300 bg-secondary flex flex-col px-4 absolute top-0 bottom-0 min-h-screen lg:hidden gap-4 w-[60%] border-r border-border",
          isOpen ? "left-0" : "-left-full",
        )}
      >
        <div className="flex justify-between items-center border-b border-border py-4">
          <p>Perpustakaan - Admin</p>
          <Button
            onClick={() => setIsOpen(false)}
            variant="secondary"
            size="sm"
          >
            <XIcon className="w-4 h-4" onClick={() => setIsOpen(false)} />
          </Button>
        </div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="w-full hover:underline hover:opacity-80 duration-300 hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-2">
        <ThemeToggle />
        <div className="lg:block hidden">
          <SignOutButton />
        </div>
        <Button onClick={() => setIsOpen(!isOpen)} className="lg:hidden block">
          {isOpen ? (
            <XIcon className="w-4 h-4" />
          ) : (
            <MenuIcon className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
