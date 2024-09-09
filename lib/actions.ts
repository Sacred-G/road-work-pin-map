"use server";

import { sql } from "@vercel/postgres";

// Assume this function exists and handles file uploads
async function uploadFile(file: File): Promise<string> {
  // Implementation for file upload
  // Returns the URL of the uploaded file
  return "https://example.com/uploaded-file.jpg";
}

export async function createUser(email: string, name: string, image: string, password: string) {
  try {
    const data =
      await sql`INSERT INTO users (email, name, image, password) VALUES (${email}, ${name}, ${image}, ${password}) RETURNING *`;
    return data.rows[0];
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
}

export async function createPin(formData: FormData) {
  try {
    const image_file = formData.get('image_file') as File | null;
    let image_url = formData.get('image_url') as string;

    if (image_file) {
      image_url = await uploadFile(image_file);
    }

    const pin_name = formData.get('pin_name') as string;
    const category = formData.get('category') as string;
    const is_active = formData.get('is_active') === 'true';
    const description = formData.get('description') as string;
    const user_id = formData.get('user_id') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);

    // Check if user exists
    const userCheck = await sql`SELECT id FROM users WHERE id = ${user_id}`;
    if (userCheck.rowCount === 0) {
      throw new Error(`User with id ${user_id} does not exist`);
    }

    const data =
      await sql`INSERT INTO pins (image_url, pin_name, category, is_active, description, user_id, latitude, longitude) 
                VALUES (${image_url}, ${pin_name}, ${category}, ${is_active}, ${description}, ${user_id}, ${latitude}, ${longitude}) 
                RETURNING *`;

    return data.rows[0];
  } catch (error) {
    console.error("Failed to create pin:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}

export async function editPin({
  pin_id,
  image_url,
  pin_name,
  category,
  is_active,
  description,
}: {
  pin_id: number;
  image_url: string;
  pin_name: string;
  category: string;
  is_active: boolean;
  description: string;
}) {
  try {
    const data =
      await sql`UPDATE pins 
                SET image_url = ${image_url}, pin_name = ${pin_name}, category = ${category}, 
                    is_active = ${is_active}, description = ${description} 
                WHERE id = ${pin_id} 
                RETURNING *`;
    return data.rows[0];
  } catch (error) {
    console.error("Failed to edit pin:", error);
    return null;
  }
}

export async function deletePin(pin_id: number, user_id: string) {
  try {
    const data =
      await sql`DELETE FROM pins WHERE id = ${pin_id} AND user_id = ${user_id}`;
    return data;
  } catch (error) {
    console.error("Failed to delete pin:", error);
    return null;
  }
}
