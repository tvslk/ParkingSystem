import pool from '../../../../lib/db'; // adjust the path if needed

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received data from Raspberry Pi:", body);

    const { spot_id, esp_id, spot_available } = body;
    const availability = (spot_available === true || 
      (typeof spot_available === 'string' && spot_available.toLowerCase() === 'true'))
      ? 1 : 0;

    await pool.query(
      "INSERT INTO parking_spots (spot_id, esp_id, availability, created_at) VALUES (?, ?, ?, NOW())",
      [spot_id, esp_id, availability]
    );

    return Response.json(
      { message: "Data received and saved successfully", received: body },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error inserting data:", error);
    return Response.json(
      { error: "Invalid data format or database error" },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const [rows]: any = await pool.query(
      `SELECT availability, COUNT(*) AS count 
       FROM (
          SELECT t.spot_id, t.availability
          FROM parking_spots t
          INNER JOIN (
            SELECT spot_id, MAX(created_at) AS maxCreated
            FROM parking_spots
            GROUP BY spot_id
          ) latest ON t.spot_id = latest.spot_id AND t.created_at = latest.maxCreated
       ) AS recent
       GROUP BY availability`
    );
    
    let available = 0;
    let occupied = 0;
    
    for (const row of rows) {
      if (row.availability === 1) {
        available = row.count;
      } else if (row.availability === 0) {
        occupied = row.count;
      }
    }
    
    return Response.json({ available, occupied }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching counts:", error);
    return Response.json(
      { error: "Error fetching data" },
      { status: 500 }
    );
  }
}