import { getSession } from '@auth0/nextjs-auth0';
import pool from '../../../../../lib/db';
import { RowDataPacket } from 'mysql2';
import { isUserAdmin } from '@/actions/isUserAdmin';
import { NextResponse } from 'next/server';

interface Reservation extends RowDataPacket {
  id: number;
  spot_id: number;
  start_time: Date;
  end_time: Date;
}

export async function POST(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const isAdmin = await isUserAdmin();
    const session = await getSession();
    if (!session || !session.user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
    }

    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return NextResponse.json({ error: "Invalid Spot ID" }, { status: 400 });
    }

    const body = await request.json();
    const { startTime, endTime } = body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    const now = new Date();
    if (start < now || end < now) {
      return NextResponse.json({ error: "Cannot reserve a past date/time" }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: "Invalid time range" }, { status: 400 });
    }

    const [conflicts] = await pool.query<Reservation[]>(
      `SELECT id FROM reservations
       WHERE spot_id = ?
         AND (
           (start_time < ? AND end_time > ?)
           OR (start_time BETWEEN ? AND ?)
           OR (end_time BETWEEN ? AND ?)
         )`,
      [spotId, end, start, start, end, start, end]
    );

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: "Time conflict detected",
        conflicts: conflicts.map(c => c.id)
      }, { status: 409 });
    }

    // Create reservation
    const [result] = await pool.query(
      `INSERT INTO reservations (spot_id, start_time, end_time)
       VALUES (?, ?, ?)`,
      [spotId, start, end]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      spotId,
      startTime: start,
      endTime: end
    }, { status: 201 });

  } catch (error) {
    console.error("Reservation error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
    }

    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return NextResponse.json({ error: "Invalid Spot ID" }, { status: 400 });
    }

    const [reservations] = await pool.query<Reservation[]>(
      `SELECT id, start_time, end_time
       FROM reservations
       WHERE spot_id = ?
       ORDER BY start_time DESC`,
      [spotId]
    );

    return NextResponse.json(reservations, { status: 200 });

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { spotId: string } }) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Authentication required." }, { status: 401 });
    }

    const url = new URL(request.url);
    const reservationId = url.searchParams.get('id');

    if (!reservationId) {
      return NextResponse.json({ error: "Missing reservation ID" }, { status: 400 });
    }

    const spotId = Number(params.spotId);
    if (isNaN(spotId)) {
      return NextResponse.json({ error: "Invalid Spot ID" }, { status: 400 });
    }

    const [result] = await pool.query(
      `DELETE FROM reservations
       WHERE id = ? AND spot_id = ?`,
      [reservationId, spotId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reservation deleted" }, { status: 200 });

  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}