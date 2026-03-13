import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: string | jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ artists: [] });
    }

    // Search for verified artists (have an approved application), exclude self
    const artists = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        type: "ARTIST",
        artistApplications: {
          some: { status: "APPROVED" },
        },
        OR: [
          { artistName: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        artistPhoto: true,
        artistApplications: {
          where: { status: "APPROVED" },
          take: 1,
          select: { artistName: true },
        },
      },
      take: 10,
    });

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("Error searching artists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
