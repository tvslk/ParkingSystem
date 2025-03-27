import pool from '../../../../lib/db'; 
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data from Raspberry Pi:", body);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON object." },
        { status: 400 }
      );
    }

    const { spot_id, esp_id, spot_available } = body;

    if (spot_id === undefined || esp_id === undefined || spot_available === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: spot_id, esp_id, or spot_available." },
        { status: 400 }
      );
    }

    if (typeof spot_id !== 'number') {
      return NextResponse.json(
        { error: "spot_id must be a number." },
        { status: 400 }
      );
    }

    if (spot_id < 1 || spot_id > 50) {
      return NextResponse.json(
        { error: "spot_id is in wrong format." },
        { status: 400 }
      );
    }

    const macAddressRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

    if (!macAddressRegex.test(esp_id)) {
      return NextResponse.json(
      { error: "esp_id must be a valid MAC address." },
      { status: 400 }
      );
    }

    if (typeof spot_available !== 'boolean' && typeof spot_available !== 'string') {
      return NextResponse.json(
        { error: "spot_available must be a boolean or string ('true' or 'false')." },
        { status: 400 }
      );
    }

    const availability = (spot_available === true || 
      (typeof spot_available === 'string' && spot_available.toLowerCase() === 'true'))
      ? 1 : 0;

    await pool.query(
      "INSERT INTO parking_spots (spot_id, esp_id, availability, created_at) VALUES (?, ?, ?, NOW())",
      [spot_id, esp_id, availability]
    );

    return NextResponse.json(
      { message: "Data received and saved successfully", received: body },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error inserting data:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

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
      `SELECT availability, COUNT(*) AS count 
       FROM (
          SELECT t.spot_id, t.availability
          FROM parking_spots t
          INNER JOIN (
            SELECT spot_id, MAX(created_at) AS maxCreated
            FROM parking_spots
            GROUP BY spot_id
          ) latest ON t.spot_id = latest.spot_id AND t.created_at = latest.maxCreated
       ) AS recent
       GROUP BY availability`
    );

    let available = 0;
    let occupied = 0;

    for (const row of rows) {
      if (row.availability === 1) {
        available = row.count;
      } else if (row.availability === 0) {
        occupied = row.count;
      }
    }

    return NextResponse.json({ available, occupied }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching counts:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}