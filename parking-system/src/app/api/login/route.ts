import jwt from "jsonwebtoken";
import pool from "../../../../lib/db";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Email and password are required" }),
      { status: 400 }
    );
  }
  
  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
      });
    }

    const KEY = process.env.KEY;
    if (!KEY) {
      return new Response(
        JSON.stringify({ error: "Server secret key not provided" }),
        { status: 500 }
      );
    }

    const isAdmin = email === "admin@gl.sk";
    const token = jwt.sign({ email, admin: isAdmin, fullName: rows[0].full_name }, KEY, { expiresIn: "1h" });

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}