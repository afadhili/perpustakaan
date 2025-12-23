import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  date,
  pgEnum,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const loanStatusEnum = pgEnum("loan_status", [
  "borrowed",
  "returned",
  "overdue",
]);

// Admin table
export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Member table
export const member = pgTable("member", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  status: statusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category table
export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Book table
export const book = pgTable("book", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  publicationDate: date("publication_date").notNull(),
  totalCopies: integer("total_copies").default(1).notNull(),
  availableCopies: integer("available_copies").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Book-Category relation (many-to-many)
export const bookCategory = pgTable("book_category", {
  bookId: integer("book_id")
    .references(() => book.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: integer("category_id")
    .references(() => category.id, { onDelete: "cascade" })
    .notNull(),
});

// Loan table
export const loan = pgTable("loan", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .references(() => member.id)
    .notNull(),
  bookId: integer("book_id")
    .references(() => book.id)
    .notNull(),
  loanDate: date("loan_date").notNull(),
  dueDate: date("due_date").notNull(),
  returnDate: date("return_date"),
  status: loanStatusEnum("status").default("borrowed").notNull(),
  fine: decimal("fine", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const memberRelations = relations(member, ({ many }) => ({
  loans: many(loan),
}));

export const bookRelations = relations(book, ({ many }) => ({
  bookCategories: many(bookCategory),
  loans: many(loan),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  bookCategories: many(bookCategory),
}));

export const bookCategoryRelations = relations(bookCategory, ({ one }) => ({
  book: one(book, {
    fields: [bookCategory.bookId],
    references: [book.id],
  }),
  category: one(category, {
    fields: [bookCategory.categoryId],
    references: [category.id],
  }),
}));

export const loanRelations = relations(loan, ({ one }) => ({
  member: one(member, {
    fields: [loan.memberId],
    references: [member.id],
  }),
  book: one(book, {
    fields: [loan.bookId],
    references: [book.id],
  }),
}));
