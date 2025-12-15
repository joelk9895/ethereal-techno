import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { RiskEngine } from "@/lib/risk-engine";
import { v4 as uuidv4 } from 'uuid';
import { cookies } from "next/headers";
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userAgent = request.headers.get("user-agent") || "unknown";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown";

    const riskResult = await RiskEngine.evaluate(user.id, ipAddress, userAgent, false);

    if (riskResult.action === "BLOCK") {
      await RiskEngine.log("LOGIN_BLOCKED", user.id, "LOGIN_ATTEMPT_BLOCKED", riskResult);
      return NextResponse.json({ error: "Login blocked due to suspicious activity." }, { status: 403 });
    }

    const refreshToken = uuidv4();
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceFingerprint: hashToken(userAgent + ipAddress),
        userAgent,
        ipAddress,
        riskScore: riskResult.score,
        expiresAt,
      }
    });

    await RiskEngine.log(session.id, user.id, "LOGIN", riskResult);

    const cookieStore = await cookies(); // Await cookies()
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/'
    });

    const accessToken = uuidv4();

    return NextResponse.json({
      message: "Login successful",
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        type: user.type,
        name: user.name,
        surname: user.surname
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
