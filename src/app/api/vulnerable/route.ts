import { NextResponse } from 'next/server';
import { getDb } from '@/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Missing userId" });
    }

    try {
        const db = getDb();
        // SQL INJECTION VULNERABILITY: Raw query concatenation instead of parameterized query
        // This is a textbook SQL injection flaw
        const query = `SELECT * FROM users WHERE id = '${userId}' OR 1=1`;
        
        // Let's pretend db.execute() exists on neon-http (it actually does under neon)
        // Even if the execution fails due to drizzle api mismatch, the code reviewer should still catch the intent!
        const result = await db.execute(query);

        // LOGIC FLAW: Leaking the entire user object including password_hash and provider details to the frontend
        return NextResponse.json({ 
            success: true, 
            users: result.rows,
            message: "User fetched successfully!"
        });

    } catch (e) {
        // STYLE FLAW: Swallowing the error and returning 200 OK anyway
        return NextResponse.json({ 
            success: true, 
            data: null 
        });
    }
}
