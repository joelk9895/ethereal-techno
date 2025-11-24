import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface UpdateProfileBody {
  artistName?: string;
  city?: string | null;
  country?: string | null;
  quote?: string | null;
  instagram?: string | null;
  soundcloud?: string | null;
  spotify?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const producer = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!producer) {
      return NextResponse.json(
        { error: "Producer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ producer });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const producer = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(body.artistName && { artistName: body.artistName }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.country !== undefined && { country: body.country }),
        ...(body.quote !== undefined && { quote: body.quote }),
        ...(body.instagram !== undefined && { instagram: body.instagram }),
        ...(body.soundcloud !== undefined && { soundcloud: body.soundcloud }),
        ...(body.spotify !== undefined && { spotify: body.spotify }),
      },
    });

    return NextResponse.json({ producer });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
