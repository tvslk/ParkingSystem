import pool from '../../../../lib/db'; 
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [rows]: any = await pool.query(
      'SELECT spot_id, created_at, availability FROM parking_spots ORDER BY created_at DESC'
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching latest visits:", error);
    return NextResponse.json({ error: "Failed to fetch latest visits" }, { status: 500 });
  }
}