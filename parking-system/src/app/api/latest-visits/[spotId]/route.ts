import pool from '../../../../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(_: Request, { params }: { params: { spotId: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { spotId } = params;
    if (!spotId) {
      return new Response(JSON.stringify({ error: "Spot ID is required" }), { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT spot_id, created_at FROM parking_spots WHERE spot_id = ? ORDER BY created_at DESC',
      [spotId]
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("Error fetching latest visits for spot:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch latest visits" }), { status: 500 });
  }
}