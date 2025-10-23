import prisma from "@/app/lib/database";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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
    // Check if metadata already exists
    const existingMetadata = await prisma.metadata.findUnique({
      where: { id },
    });

    let newKit;

    if (existingMetadata) {
      // If metadata exists, update both the construction kit and metadata
      newKit = await prisma.constructionkit.update({
        where: { id },
        data: {
          kitName,
          description,
          metadata: {
            update: {
              bpm: bpm || "120",
              key: key || "C",
              styles: styles || [],
              moods: moods || [],
            },
          },
        },
        include: {
          metadata: true,
        },
      });
    } else {
      newKit = await prisma.constructionkit.update({
        where: { id },
        data: {
          kitName,
          description,
          metadata: {
            create: {
              id: id,
              bpm: bpm || "120",
              key: key || "C",
              styles: styles || [],
              moods: moods || [],
            },
          },
        },
        include: {
          metadata: true,
        },
      });
    }

    return NextResponse.json(newKit);
  } catch (error) {
    console.error("Error updating construction kit:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
