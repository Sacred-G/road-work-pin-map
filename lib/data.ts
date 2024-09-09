import { sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

export async function fetchPinDataById(id: number) {
  noStore();
  try {
    const pinData = await sql`SELECT * FROM pins WHERE id = ${id}`;
    const pin = pinData.rows[0];
    if (pin) {
      const userData = await fetchUserByPinId(id);
      return { ...pin, userEmail: userData?.email };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch pin:", error);
    return null;
  }
}


export async function findUserByEmail(email: string) {
  noStore();
  try {
    const data = await sql`SELECT * FROM users WHERE email = ${email}`;
    return data.rows[0];
  } catch (error) {
    console.error("Failed to find user:", error);
    return null;
  }
}
export async function findUserByCredentials(credentials: any) {
  noStore();
  try {
    const data = await sql`SELECT * FROM users WHERE email = ${credentials.email} AND password = ${credentials.password}`;
    return data.rows[0];
  } catch (error) {
    console.error("Failed to find user:", error);
    return null;
  }
}
export async function fetchPinsData(
  category: string | null,
  user: string | null,
  pin_name: string | null
) {
  noStore();
  try {
    const res = await fetch(`/api/pins`, {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: category,
        user: user,
        pin_name: pin_name,
      }),
    });
    const pins = await res.json();
    return pins;
  } catch (error) {
    console.error("Failed to fetch pins:", error);
  }
}

export async function fetchCategories() {
  noStore();
  try {
    const res = await fetch(`/api/category`, { cache: "no-store" });
    const data = await res.json();
    const categories = data.map((category: { category: string }) => {
      return category.category;
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch categories", error);
  }
}

export async function fetchUsers() {
  noStore();
  try {
    const res = await fetch(`/api/user`, { cache: "no-store" });
    const data = await res.json();
    return data.map((user: { id: string; email: string; name: string; image: string }) => ({
      id: user.id,
      email: user.email || 'No email',
      name: user.name || 'Unknown',
      image: user.image || ''
    }));
  } catch (error) {
    console.error("Failed to fetch users", error);
    return [];
  }
}
export async function fetchPinsList(
  category: string | null,
  user: string | null,
  pin_name: string | null

) {
  noStore();
  try {
    const res = await fetch(`/api/pinsList`, {
      cache: "no-store",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: category,
        user: user,
        pin_name: pin_name,
      }),
    });
    const pins = await res.json();
    const pinsList = pins.map((pin: { pin_name: string }) => {
      return pin.pin_name;
    });
    return pinsList;
  } catch (error) {
    console.error("Failed to fetch pins:", error);
  }
}
export async function fetchUserByPinId(pinId: number) {
  noStore();
  try {
    const data = await sql`
      SELECT users.* 
      FROM users 
      JOIN pins ON users.id = pins.user_id 
      WHERE pins.id = ${pinId}
    `;
    return data.rows[0];
  } catch (error) {
    console.error("Failed to fetch user by pin:", error);
    return null;
  }
}
