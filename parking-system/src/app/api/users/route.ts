"use server";
import pool from '../../../../lib/db';
import { isUserAdmin } from '../../../actions/isUserAdmin'; // Adjust the import path as necessary

export async function GET() {
    try {
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }

        const [rows]: any = await pool.query('SELECT * FROM users');
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
    }
}