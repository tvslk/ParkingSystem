import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(req: Request) {
    try {
        const session = await getSession();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized. Authentication required." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        const [total]: any = await pool.query(
            "SELECT COUNT(DISTINCT spot_id) as total FROM parking_spots"
        );

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
                GROUP BY spot_id
             ) latest ON t.spot_id = latest.spot_id AND t.created_at = latest.maxCreated
             ORDER BY CAST(t.spot_id AS UNSIGNED) ASC
             LIMIT ? OFFSET ?`,
            [limit, (page - 1) * limit]
        );
        return NextResponse.json(
            {
                spots: rows.map((row: any) => ({
                    spot_id: row.spot_id,
                    available: row.availability === 1,
                    reserved: Boolean(row.reserved),
                    last_updated: row.created_at,
                })),
                total: total[0].total,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching spots:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again later." },
            { status: 500 }
        );
    }
}