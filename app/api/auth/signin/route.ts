import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        artistApplications: {
          where: { status: "APPROVED" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // --- SESSION & TOKEN LOGIC ---

    // 1. Generate Access Token (JWT) - Short Lived (e.g., 15m)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: "15m" } // Short expiry for security
    );

    // 2. Generate Refresh Token (Opaque UUID) - Long Lived (e.g., 7d)
    const refreshToken = uuidv4();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 3. Create Session in Database
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt: refreshExpiresAt,
        deviceFingerprint: "unknown", // You might want to implement client-side fingerprinting later
        userAgent,
        ipAddress,
      },
    });

    // 4. Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: refreshExpiresAt,
      path: "/",
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      type: user.type,
      country: user.country,
      canCreateSamples: user.canCreateSamples,
      canCreateSerum: user.canCreateSerum,
      canCreateDiva: user.canCreateDiva,
      approvedAt: user.approvedAt,
      createdAt: user.createdAt,
      // Add artist data if exists
      artistName: user.artistApplications[0]?.artistName || null,
      artistPhoto: user.artistApplications[0]?.photoUrl || null,
    };

    return NextResponse.json({
      message: "Sign in successful",
      accessToken,
      // refreshToken is NOT returned in body, only cookie
      user: userData,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
  }
}
