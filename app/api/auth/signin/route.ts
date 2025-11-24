import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
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
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
