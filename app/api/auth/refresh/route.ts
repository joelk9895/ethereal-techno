import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { RiskEngine } from "@/lib/risk-engine";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";
import crypto from 'crypto';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies(); // Await cookies()
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
        }

        const refreshTokenHash = hashToken(refreshToken);

        const session = await prisma.session.findFirst({
            where: { refreshTokenHash },
            include: { user: true } // Include user to get details for JWT
        });

        if (!session || !session.user) {
            return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
        }

        const userAgent = request.headers.get("user-agent") || "unknown";
        const ipAddress = request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown";

        const riskResult = await RiskEngine.evaluate(session.userId, ipAddress, userAgent, false);

        if (riskResult.action === "BLOCK") {
            await prisma.session.delete({ where: { id: session.id } });
            await RiskEngine.log(session.id, session.userId, "REFRESH_BLOCK", riskResult);
            return NextResponse.json({ error: "Session revoked due to high risk" }, { status: 403 });
        }

        if (riskResult.action === "STEP_UP" || riskResult.action === "SOFT_CHALLENGE") {
            await RiskEngine.log(session.id, session.userId, "REFRESH_CHALLENGE", riskResult);
            return NextResponse.json({ error: "Security challenge required", risk: riskResult.action }, { status: 403 });
        }

        const newRefreshToken = uuidv4();
        const newRefreshTokenHash = hashToken(newRefreshToken);

        await prisma.session.update({
            where: { id: session.id },
            data: {
                refreshTokenHash: newRefreshTokenHash,
                lastActive: new Date(),
                ipAddress,
                userAgent,
                riskScore: riskResult.score
            }
        });

        await RiskEngine.log(session.id, session.userId, "REFRESH_SUCCESS", riskResult);

        cookieStore.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: session.expiresAt,
            path: '/'
        });

        const newAccessToken = jwt.sign(
            {
                userId: session.user.id,
                email: session.user.email,
                type: session.user.type,
            },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        return NextResponse.json({
            message: "Session refreshed",
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error("Refresh Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
