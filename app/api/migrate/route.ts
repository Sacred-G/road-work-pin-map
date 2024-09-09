import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Add password column
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);`;
    
    // Update existing users with a temporary password
    await sql`UPDATE users SET password = '$2a$10$temporaryPasswordHash' WHERE password IS NULL;`;

    return NextResponse.json({ message: 'Migration completed successfully' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}