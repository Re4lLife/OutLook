import { jwtVerify } from 'jose';

export async function POST(req) {
    try {
        const { token } = await req.json();
        
        if (!token) {
            return new Response(JSON.stringify({ error: "No token provided" }), { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        
        const { payload } = await jwtVerify(token, secret);

        return new Response(JSON.stringify({ valid: true, user: payload }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return new Response(JSON.stringify({ valid: false, error: "Invalid token" }), { 
            status: 401 
        });
    }
}