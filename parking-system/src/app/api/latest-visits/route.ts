import pool from '../../../../lib/db'; 
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const [rows]: any = await pool.query(
      'SELECT spot_id, created_at FROM parking_spots ORDER BY created_at DESC'
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching latest visits:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch latest visits" }), { status: 500 });
  }
}