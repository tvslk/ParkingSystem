import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';
import { createAccessToken } from '@/actions/createAccessToken';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let responseUser: any = { name: "User Data Not Available", user_id: userId };
    let responseVisits: any[] = [];

    try {
      const accessToken = await createAccessToken();
      const auth0Res = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (auth0Res.ok) {
        const userInfoFromAuth0 = await auth0Res.json();
        responseUser = { ...responseUser, ...userInfoFromAuth0 };
      }
    } catch (authError: any) {
      // Log error or handle as needed, but continue to fetch visits
      console.error(`Auth0 user fetch error for ${userId}: ${authError.message}`);
    }

    try {
      const visitsQuery = `
        SELECT id, user_id, start_date, end_date
        FROM visits
        WHERE user_id = ?
        ORDER BY start_date DESC
      `;
      const [dbVisitsResults] = await pool.query(visitsQuery, [userId]);

      if (Array.isArray(dbVisitsResults)) {
        responseVisits = dbVisitsResults.map((visit: any) => ({
          ...visit,
          user: responseUser,
        }));
      }
    } catch (dbError: any) {
      // Log error or handle as needed
      console.error(`Database visits fetch error for ${userId}: ${dbError.message}`);
    }

    return NextResponse.json({
      user: responseUser,
      visits: responseVisits,
    });

  } catch (error: any) {
    console.error(`Top-level error for ${userId}: ${error.message}`);
    return NextResponse.json({ error: "An unexpected server error occurred.", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();
    if (!startDate) {
        return NextResponse.json({ error: "Bad Request: startDate is required." }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO visits (user_id, start_date, end_date)
      VALUES (?, ?, ?)
    `;
    const [insertResult]: any = await pool.query(insertQuery, [userId, startDate, endDate]);

    return NextResponse.json({ visitId: insertResult.insertId });
  } catch (error: any) {
    console.error(`Visit creation error for ${userId}: ${error.message}`);
    return NextResponse.json({ error: "Failed to create visit.", details: error.message }, { status: 500 });
  }
}