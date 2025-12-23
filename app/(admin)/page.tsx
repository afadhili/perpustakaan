"use client";
import { Book, getAllbooks } from "@/actions/books";
import { getAllLoans, Loan } from "@/actions/loans";
import { getAllMembers, Member } from "@/actions/members";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookPlus, PlusIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const membersData = await getAllMembers();
      const booksData = await getAllbooks();
      const loansData = await getAllLoans();
      setMembers(membersData);
      setBooks(booksData);
      setLoans(loansData);
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-6 px-8 md:px-16 lg:px-20">
        <div className="text-center md:text-left">
          <h2 className="font-semibold text-lg md:text-xl lg:text-3xl">
            Selamat datang Administrator
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Ringkasan sistem perpustakaan anda
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button>
            Tambah Buku <PlusIcon />
          </Button>
          <Button>
            Tambah Anggota <UserPlus />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-8 md:px-16 lg:px-20">
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Anggota</CardTitle>
            <CardDescription>
              Jumlah anggota perpustakaan (tidak termasuk admin)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{members.length}</h2>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/members">
                Kelola Anggota <UserPlus />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Buku</CardTitle>
            <CardDescription>
              Jumlah buku yang tersedia di perpustakaan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{books.length}</h2>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/books">
                Kelola Buku <BookPlus />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Peminjaman</CardTitle>
            <CardDescription>
              Jumlah peminjaman yang sedang berlangsung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h2 className="text-2xl font-semibold">{loans.length}</h2>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/loans">
                Kelola Peminjaman <BookPlus />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
