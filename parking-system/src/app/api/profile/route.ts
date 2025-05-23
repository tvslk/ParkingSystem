import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import pool from '../../../../lib/db'; // Your MySQL pool

// GET - Retrieve the stored profile picture URL
export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ picture: null }, { status: 401 });
  }

  try {
    const [rows] = await pool.query(
      "SELECT picture_url FROM user_profiles WHERE auth_sub = ?",
      [session.user.sub]
    );
    
    const picture = (rows as any[])[0]?.picture_url || null;
    return NextResponse.json({ picture });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST - Save a profile picture URL
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const pictureUrl = body.pictureUrl;
    
    if (!pictureUrl) {
      return NextResponse.json({ error: "No picture URL provided" }, { status: 400 });
    }

    // Use REPLACE to simplify the upsert operation
    await pool.query(
      "REPLACE INTO user_profiles (auth_sub, picture_url) VALUES (?, ?)",
      [session.user.sub, pictureUrl]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving profile picture:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}