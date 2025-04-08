import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import QRCode from "qrcode";
import pool from "../../../../../lib/db"; 

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const randomCode = Math.random().toString(36).slice(2, 10);
    const now = new Date();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO user_qr_codes (user_id, code, created_at, expires_at)
       VALUES (?, ?, ?, ?)`,
      [userId, randomCode, now, expires]
    );

    const qrCodeDataUrl = await QRCode.toDataURL(randomCode);

    return NextResponse.json({
      code: randomCode,
      qrCodeDataUrl,
      expiresAt: expires.toISOString(),
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}