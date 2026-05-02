import prisma from "@/app/lib/database";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function POST(req: NextRequest) {
  // Authenticate user
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  try {
    jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const body = await req.json();

  const { id, kitName, description, styles, moods, bpm, key } = body;
  if (
    !id ||
    !kitName ||
    !styles ||
    !Array.isArray(styles) ||
    styles.length === 0 ||
    !moods ||
    !Array.isArray(moods) ||
    moods.length === 0 ||
    !bpm ||
    !key
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // At this stage, we only persist the metadata.
    // The actual constructionkit record is created by POST /api/import/constructionKit/[id]
    // once files have been uploaded and a defaultFullLoop content exists.
    const metadata = await prisma.metadata.upsert({
      where: { id },
      update: {
        bpm: bpm || "120",
        key: key || "C",
        styles: styles || [],
        moods: moods || [],
      },
      create: {
        id,
        bpm: bpm || "120",
        key: key || "C",
        styles: styles || [],
        moods: moods || [],
      },
    });

    // If a constructionkit already exists (e.g. re-saving metadata), update it
    const existingKit = await prisma.constructionkit.findFirst({
      where: { OR: [{ id }, { kitName: id }] },
    });

    if (existingKit) {
      const updatedKit = await prisma.constructionkit.update({
        where: { id: existingKit.id },
        data: {
          kitName,
          description,
        },
        include: { metadata: true },
      });
      return NextResponse.json(updatedKit);
    }

    // Return the metadata + kitName so the client knows the save succeeded
    return NextResponse.json({
      id,
      kitName,
      description,
      metadata,
    });
  } catch (error) {
    console.error("Error creating/updating construction kit:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
