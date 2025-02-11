import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
    });
  }

  const KEY = process.env.KEY;
  if (!KEY) {
    return new Response(JSON.stringify({ error: "Server secret key not provided" }), {
      status: 500,
    });
  }

  const isAdmin = email === "admin@gl.sk" && password === "admin";
  const token = jwt.sign({ email, admin: isAdmin }, KEY, { expiresIn: "1h" });

  return new Response(JSON.stringify({ token }), { status: 200 });
}