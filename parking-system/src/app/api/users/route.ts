import pool from '../../../../lib/db'; 

export async function GET(){
    try
    {
        const [rows]: any = await pool.query(
            'SELECT * FROM users'
        );
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error: any)
    {
        console.error("Error fetching users:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
    }
}
