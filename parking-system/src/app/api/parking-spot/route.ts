import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const [rows]: any = await pool.query(
      `SELECT t.spot_id, t.availability, t.created_at
       FROM parking_spots t
       INNER JOIN (
          SELECT spot_id, MAX(created_at) AS maxCreated
          FROM parking_spots
          GROUP BY spot_id
       ) latest ON t.spot_id = latest.spot_id AND t.created_at = latest.maxCreated
       ORDER BY t.spot_id
       LIMIT 30`
    );

    const spots = rows.map((row: any) => ({
      spot_id: row.spot_id,
      available: row.availability === 1,
      last_updated: row.created_at
    }));

    return NextResponse.json(spots, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching spots:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}