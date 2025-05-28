
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../lib/db';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const userId = params.userId;
    // Fetch visits for this user
    const query = `
      SELECT id, user_id, start_date, end_date
      FROM visits
      WHERE user_id = $1
      ORDER BY start_date DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Visits fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: any) {
    try {
      const userId = params.userId;
      const { startDate, endDate } = await request.json();
  
      const insertQuery = `
        INSERT INTO visits (user_id, start_date, end_date)
        VALUES (?, ?, ?)
      `;
      const [insertResult]: any = await pool.query(insertQuery, [userId, startDate, endDate]);
  
      return NextResponse.json({ visitId: insertResult.insertId });
    } catch (error: any) {
      console.error('Visits creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
