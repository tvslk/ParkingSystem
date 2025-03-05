import pool from '../../../../lib/db'; 

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      'SELECT spot_id, created_at FROM parking_spots ORDER BY created_at DESC'
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching latest visits:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch latest visits" }), { status: 500 });
  }
}