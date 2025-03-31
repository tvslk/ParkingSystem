import pool from '../../../../../lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Authentication required." },
        { status: 401 }
      );
    }

    const { id } = params;
    const spotId = parseInt(id, 10);

    if (isNaN(spotId)) {
      return NextResponse.json(
        { status: 'not_found' },
        { status: 404 }
      );
    }

    const [rows]: any = await pool.query(
      `SELECT 
        t.spot_id, 
        t.availability, 
        t.created_at,
        EXISTS (
          SELECT 1 
          FROM reservations 
          WHERE spot_id = t.spot_id 
          AND NOW() BETWEEN start_time AND end_time
        ) AS reserved
       FROM parking_spots t
       INNER JOIN (
          SELECT spot_id, MAX(created_at) AS maxCreated
          FROM parking_spots
          WHERE spot_id = ?
          GROUP BY spot_id
       ) latest ON t.spot_id = latest.spot_id AND t.created_at = latest.maxCreated
       WHERE t.spot_id = ?`,
      [spotId, spotId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { status: 'not_found' },
        { status: 404 }
      );
    }

    const spot = rows[0];
    
    return NextResponse.json({
      spot_id: spot.spot_id,
      available: spot.availability === 1,
      reserved: Boolean(spot.reserved),
      last_updated: spot.created_at
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching spot:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}