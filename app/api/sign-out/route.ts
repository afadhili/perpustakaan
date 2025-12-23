import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
