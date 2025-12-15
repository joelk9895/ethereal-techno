import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";


const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface UpdateProfileBody {
  name?: string;
  surname?: string | null;
  country?: string | null;
}

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        type: true,
        country: true,
        approvedAt: true,
        canCreateSamples: true,
        canCreateSerum: true,
        canCreateDiva: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {

  }
}

// Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateProfileBody;
    const { name, surname, country } = body;

    const updateData: Partial<{
      name: string;
      surname: string | null;
      country: string | null;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (surname !== undefined) updateData.surname = surname ?? null;
    if (country !== undefined) updateData.country = country ?? null;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        type: true,
        country: true,
        approvedAt: true,
        canCreateSamples: true,
        canCreateSerum: true,
        canCreateDiva: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {

  }
}
