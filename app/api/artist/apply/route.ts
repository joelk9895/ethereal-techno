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

interface ApplicationBody {
  artistName?: string;
  quote?: string;
  photoUrl?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  x?: string | null;
  linktree?: string | null;
  spotify?: string | null;
  soundcloud?: string | null;
  beatport?: string | null;
  bandcamp?: string | null;
  appleMusic?: string | null;
  track1?: string | null;
  track2?: string | null;
  track3?: string | null;
  canCreateLoops?: boolean;
  canCreateSerum?: boolean;
  canCreateDiva?: boolean;
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

    const existingApplication = await prisma.artistApplication.findFirst({
      where: { userId: decoded.userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { exists: true, application: existingApplication },
        { status: 200 }
      );
    }

    return NextResponse.json({ exists: false }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
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

    const body = (await request.json()) as ApplicationBody;

    const existingApplication = await prisma.artistApplication.findFirst({
      where: { userId: decoded.userId },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already exists" },
        { status: 400 }
      );
    }

    const application = await prisma.artistApplication.create({
      data: {
        userId: decoded.userId,
        artistName: body.artistName || "",
        email: body.quote || "",
        status: "PENDING",
        quote: body.quote || "",
        photoUrl: body.photoUrl || null,
        instagram: body.instagram || null,
        tiktok: body.tiktok || null,
        facebook: body.facebook || null,
        youtube: body.youtube || null,
        x: body.x || null,
        linktree: body.linktree || null,
        spotify: body.spotify || null,
        soundcloud: body.soundcloud || null,
        beatport: body.beatport || null,
        bandcamp: body.bandcamp || null,
        appleMusic: body.appleMusic || null,
        track1: body.track1 || null,
        track2: body.track2 || null,
        track3: body.track3 || null,
        canCreateLoops: body.canCreateLoops || false,
        canCreateSerum: body.canCreateSerum || false,
        canCreateDiva: body.canCreateDiva || false,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
