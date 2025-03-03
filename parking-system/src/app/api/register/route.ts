import pool from '../../../../lib/db'; // adjust the path if needed
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Full Name, email and password are required" }),
        { status: 400 }
      );
    }

    const [existingUsers]: any = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: "User with same email already exists" }), { status: 409 });
    }

    await pool.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [fullName, email, password]
    );

    const KEY = process.env.KEY;
    if (!KEY) {
      return new Response(JSON.stringify({ error: "Server secret key not provided" }), { status: 500 });
    }


    return new Response(null, { status: 302, headers: { Location: "/signin" } });  } catch (error: any) {
    console.error("Error in registration:", error);
    return new Response(JSON.stringify({ error: "Registration failed" }), { status: 500 });
  }
}