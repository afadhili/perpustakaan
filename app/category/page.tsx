import { redirect } from "next/navigation";

export default function CategoryRoute() {
  redirect("/categories"); // Redirect ke halaman kategori di admin
}