
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db'; // MySQL pool from mysql2/promise

export async function POST(request: NextRequest) {
  try {
    const { qrCode, espId } = await request.json();

    // (Optional) Validate espId as MAC address:
    // const macRegex = /^[A-Fa-f0-9]{2}([-:][A-Fa-f0-9]{2}){5}$/;
    // if (!macRegex.test(espId)) {
    //   return NextResponse.json({ error: 'Invalid ESP ID (must be MAC)' }, { status: 400 });
    // }

    // 1) Check user_qr_codes for the provided qrCode
    const qrQuery = `
      SELECT user_id, started_at, expires_at
      FROM user_qr_codes
      WHERE qr_code = ?
      LIMIT 1
    `;
    interface QrRow {
      user_id: number;
      started_at: string;
      expires_at: string;
    }
    const [qrRows] = await pool.query(qrQuery, [qrCode]);
    if ((qrRows as QrRow[]).length === 0) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    const { user_id, started_at, expires_at } = (qrRows as QrRow[])[0];

    // 2) Validate timestamps
    const now = new Date();
    if (now < new Date(started_at) || now > new Date(expires_at)) {
      return NextResponse.json({ error: 'QR code expired or not yet active' }, { status: 400 });
    }

    // 3) Create a new visit record in visits table
    const insertQuery = `
      INSERT INTO visits (user_id, start_date)
      VALUES (?, NOW())
    `;
    const [insertResult]: any = await pool.query(insertQuery, [user_id]);
    const visitId = insertResult.insertId;

    return NextResponse.json({ success: true, visitId });
  } catch (error: any) {
    console.error('QR Check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}