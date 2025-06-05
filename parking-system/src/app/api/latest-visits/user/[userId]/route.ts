import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';
import { createAccessToken } from '@/actions/createAccessToken';

export async function GET(request: NextRequest, { params }: { params: { userId: string }}) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;
    
    // 1. Fetch visits for this user
    const query = `
      SELECT id, user_id, start_date, end_date
      FROM visits
      WHERE user_id = ?
      ORDER BY start_date DESC
    `;
    const [visits] = await pool.query(query, [userId]);
    
    // 2. Fetch user info from Auth0
    let userInfo = null;
    try {
      const accessToken = await createAccessToken();
      const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        userInfo = await res.json();
      }
    } catch (e) {
      console.error(`Error fetching user ${userId}:`, e);
    }
    
    // 3. Attach user info to each visit
    const visitsWithUser = Array.isArray(visits) ? visits.map((visit: any) => ({
      ...visit,
      user: userInfo || { name: 'Unknown' }
    })) : [];
    
    return NextResponse.json(visitsWithUser);
  } catch (error: any) {
    console.error('Visits fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string }}) {
    try {
      // Added authentication check
      const session = await getSession();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

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