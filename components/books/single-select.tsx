"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronDown } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  availableCopies: number;
}

interface SingleSelectBookProps {
  books: Book[];
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  onlyAvailable?: boolean; // Optional: filter only available books
}

export function SingleSelectBook({
  books,
  value,
  onChange,
  placeholder = "Pilih buku...",
  onlyAvailable = false,
}: SingleSelectBookProps) {
  const [open, setOpen] = React.useState(false);

  const filteredBooks = onlyAvailable
    ? books.filter((b) => b.availableCopies > 0)
    : books;

  const selectedBook = books.find((b) => b.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedBook
            ? `${selectedBook.title} (${selectedBook.author}) - Tersedia: ${selectedBook.availableCopies}`
            : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari buku..." />
          <CommandEmpty>Buku tidak ditemukan.</CommandEmpty>
          <CommandGroup>
            {filteredBooks.map((book) => (
              <CommandItem
                key={book.id}
                value={book.title}
                onSelect={() => {
                  onChange(book.id === value ? null : book.id);
                  setOpen(false);
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === book.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {book.title} ({book.author}) - Tersedia: {book.availableCopies}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
