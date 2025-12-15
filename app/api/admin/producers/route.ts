import { NextRequest, NextResponse } from "next/server";
import { UserType } from "@prisma/client";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// --- Types ---
interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface AdminUser {
  id: string;
  type: UserType;
}

async function verifyAdmin(request: NextRequest): Promise<AdminUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, type: true },
    });

    return user?.type === UserType.ADMIN ? user : null;
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const producers = await prisma.user.findMany({
      where: {
        type: {
          in: [UserType.ARTIST],
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        type: true,
        country: true,
        createdAt: true,
        approvedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ producers });
  } catch (error) {
    console.error("Producers fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {

  }
}
