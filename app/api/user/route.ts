import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export async function GET(request: Request) {
  noStore();
  try {
    const data = await sql`SELECT id, email, name, image FROM users LIMIT 10`;
    return Response.json(data.rows);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return Response.json([]);
  }
}