import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { generateToken } from "@/lib/jwt";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Validate input
  if (!username || !password) {
    return new Response(
      JSON.stringify({ error: "Missing username or password", success: false }),
      { status: 400 },
    );
  }

  // Check if user exists
  const [user] = await db
    .select()
    .from(admin)
    .where(eq(admin.username, username))
    .limit(1);

  if (!user) {
    return new Response(
      JSON.stringify({ error: "Invalid username or password", success: false }),
      { status: 401 },
    );
  }

  // Check if password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response(
      JSON.stringify({ error: "Invalid username or password", success: false }),
      { status: 401 },
    );
  }

  // Generate JWT token
  const token = generateToken(user);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
  });
}
