import pool from '../../../../../lib/db';
import { RowDataPacket } from 'mysql2';

interface Reservation extends RowDataPacket {
  id: number;
  spot_id: number;
  start_time: Date;
  end_time: Date;
}

export async function POST(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return new Response(JSON.stringify({ error: "Invalid Spot ID" }), { status: 400 });
    }

    const body = await request.json();
    const { startTime, endTime } = body;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return new Response(JSON.stringify({ error: "Invalid time range" }), { status: 400 });
    }

    const [conflicts] = await pool.query<Reservation[]>(
      `SELECT id FROM reservations 
       WHERE spot_id = ?
       AND ((start_time < ? AND end_time > ?) 
        OR (start_time BETWEEN ? AND ?) 
        OR (end_time BETWEEN ? AND ?))`,
      [spotId, end, start, start, end, start, end]
    );

    if (conflicts.length > 0) {
      return new Response(JSON.stringify({ 
        error: "Time conflict detected",
        conflicts: conflicts.map(c => c.id)
      }), { status: 409 });
    }

    // Create reservation
    const [result] = await pool.query(
      `INSERT INTO reservations (spot_id, start_time, end_time)
       VALUES (?, ?, ?)`,
      [spotId, start, end]
    );

    return new Response(JSON.stringify({
      id: (result as any).insertId,
      spotId,
      startTime: start,
      endTime: end
    }), { status: 201 });

  } catch (error) {
    console.error("Reservation error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return new Response(JSON.stringify({ error: "Invalid Spot ID" }), { status: 400 });
    }

    const [reservations] = await pool.query<Reservation[]>(
      `SELECT id, start_time, end_time 
       FROM reservations 
       WHERE spot_id = ? 
       ORDER BY start_time DESC`,
      [spotId]
    );

    return new Response(JSON.stringify(reservations), { status: 200 });

  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const url = new URL(request.url);
    const reservationId = url.searchParams.get('id');
    
    if (!reservationId) {
      return new Response(JSON.stringify({ error: "Missing reservation ID" }), { status: 400 });
    }

    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return new Response(JSON.stringify({ error: "Invalid Spot ID" }), { status: 400 });
    }

    const [result] = await pool.query(
      `DELETE FROM reservations 
       WHERE id = ? AND spot_id = ?`,
      [reservationId, spotId]
    );

    if ((result as any).affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Reservation deleted" }), { status: 200 });

  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}