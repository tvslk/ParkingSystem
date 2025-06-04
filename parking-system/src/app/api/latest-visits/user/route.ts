import pool from '../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get all visits
    const [visits]: any = await pool.query(
      'SELECT id, user_id, start_date, end_date FROM visits ORDER BY start_date DESC LIMIT 100'
    );

    // 2. Get unique user IDs as strings
    const userIds = Array.from(new Set(visits.map((v: any) => String(v.user_id)))) as string[];

    // 3. Fetch user info for each user_id (in parallel)
    const userInfoMap: Record<string, any> = {};
    await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/users/${encodeURIComponent(userId)}`
          );
          if (res.ok) {
            const user = await res.json();
            userInfoMap[userId] = user;
          }
        } catch (e) {
          userInfoMap[userId] = null;
        }
      })
    );

    // 4. Attach user info to each visit
    const visitsWithUser = visits.map((visit: any) => ({
      ...visit,
      user: userInfoMap[String(visit.user_id)] || { name: 'Unknown' }
    }));

    return NextResponse.json(visitsWithUser, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching visits with users:", error);
    return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
  }
}