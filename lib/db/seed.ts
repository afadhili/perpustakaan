"use server";
import { db } from ".";
import { admin, book, member } from "./schema";
import bcrypt from "bcrypt";

export async function seed() {
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10,
  );

  await db.insert(admin).values({
    username: process.env.ADMIN_USERNAME || "admin",
    password: hashedPassword,
  });

  await db.insert(book).values({
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    publicationDate: "1925-04-10",
    availableCopies: 5,
    totalCopies: 10,
  });
  await db.insert(book).values({
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    publicationDate: "1960-07-11",
    availableCopies: 3,
    totalCopies: 7,
  });
  await db.insert(book).values({
    title: "1984",
    author: "George Orwell",
    publicationDate: "1949-06-08",
    availableCopies: 2,
    totalCopies: 4,
  });
  await db.insert(book).values({
    title: "Pride and Prejudice",
    author: "Jane Austen",
    publicationDate: "1813-01-28",
    availableCopies: 4,
    totalCopies: 8,
  });
  await db.insert(book).values({
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    publicationDate: "1951-07-16",
    availableCopies: 6,
    totalCopies: 12,
  });
  await db.insert(book).values({
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    publicationDate: "1937-09-21",
    availableCopies: 7,
    totalCopies: 14,
  });

  await db.insert(member).values({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    address: "123 Main St",
    status: "active",
  });

  await db.insert(member).values({
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "9876543210",
    address: "456 Elm St",
    status: "inactive",
  });

  await db.insert(member).values({
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "5555555555",
    address: "789 Oak St",
    status: "active",
  });

  await db.insert(member).values({
    name: "Bob Brown",
    email: "bob.brown@example.com",
    phone: "1111111111",
    address: "321 Pine St",
    status: "active",
  });
}
