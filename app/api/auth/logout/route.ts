import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/database";
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies(); // Await cookies()
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (refreshToken) {
            const refreshTokenHash = hashToken(refreshToken);
            await prisma.session.deleteMany({
                where: { refreshTokenHash }
            });
        }

        cookieStore.delete('refresh_token');

        return NextResponse.json({ message: "Logged out" });
    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}
