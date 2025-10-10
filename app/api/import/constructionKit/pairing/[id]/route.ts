import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const constructionKit = await prisma.constructionkit.findUnique({
      where: { id },
      select: {
        id: true,
        kitName: true,
        contents: {
          where: { contentType: { in: ["Sample Loop", "Preset", "MIDI"] } },
          select: {
            id: true,
            contentName: true,
            contentType: true,
            soundGroup: true,
            subGroup: true,
            fileId: true,
            file: {
              select: {
                fileName: true,
                awsKey: true,
              },
            },
          },
        },
      },
    });

    if (!constructionKit) {
      return NextResponse.json(
        { error: "No construction kit found for the given ID" },
        { status: 404 }
      );
    }

    return NextResponse.json(constructionKit, { status: 200 });
  } catch (error) {
    console.error("Error fetching construction kit:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { pair } = body;

  if (
    !pair ||
    !pair.items ||
    !Array.isArray(pair.items) ||
    pair.items.length === 0
  ) {
    return NextResponse.json(
      { error: "Invalid or missing pair data" },
      { status: 400 }
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const constructionKit = await tx.constructionkit.findUnique({
        where: { id },
      });

      if (!constructionKit) {
        return NextResponse.json(
          { error: "Construction kit not found" },
          { status: 404 }
        );
      }

      const pairItems = await Promise.all(
        pair.items.map((itemId: string) =>
          tx.content.findUnique({
            where: { id: itemId },
            include: { file: true },
          })
        )
      );

      const validItems = pairItems.filter((item) => item !== null);

      if (validItems.length === 0) {
        return NextResponse.json(
          { error: "No valid content items found" },
          { status: 400 }
        );
      }

      const audioItem = validItems.find(
        (item) => item.contentType === "Sample Loop"
      );
      const midiItem = validItems.find((item) => item.contentType === "MIDI");
      const presetItem = validItems.find(
        (item) => item.contentType === "Preset"
      );
      if (audioItem && midiItem && presetItem) {
        const preset = await tx.preset.create({
          data: {
            name: pair.name || `${constructionKit.kitName} - Preset`,
            loopContentId: audioItem.id,
            midiContentId: midiItem.id,
            presetContentId: presetItem.id,
            metadataId: constructionKit.metadataId,
            constructionkitId: constructionKit.id,
          },
        });
        await tx.content.updateMany({
          where: {
            id: {
              in: [audioItem.id, midiItem.id, presetItem.id],
            },
          },
          data: {
            constructionkitId: null,
          },
        });

        return NextResponse.json({
          success: true,
          pairedContent: {
            type: "Preset",
            id: preset.id,
            name: preset.name,
          },
        });
      } else if (audioItem && midiItem) {
        const loopAndMidi = await tx.loopandmidi.create({
          data: {
            name: pair.name || `${constructionKit.kitName} - Loop+MIDI`,
            loopContentId: audioItem.id,
            midiContentId: midiItem.id,
            metadataId: constructionKit.metadataId,
            constructionkitId: constructionKit.id,
          },
        });

        await tx.content.updateMany({
          where: {
            id: {
              in: [audioItem.id, midiItem.id],
            },
          },
          data: {
            constructionkitId: null,
          },
        });

        return NextResponse.json({
          success: true,
          pairedContent: {
            type: "Loop+MIDI",
            id: loopAndMidi.id,
            name: loopAndMidi.name,
          },
        });
      } else {
        const primaryItem = audioItem || validItems[0];

        const pairedContent = await tx.content.create({
          data: {
            contentName: pair.name || `${constructionKit.kitName} - Paired`,
            contentType: "Paired Sound",
            soundGroup: primaryItem?.soundGroup || "Paired",
            subGroup: primaryItem?.subGroup || "",
            fileId: primaryItem.fileId,
            constructionkitId: null,
            metadataId: constructionKit.metadataId,
          },
        });

        await tx.content.updateMany({
          where: {
            id: {
              in: pair.items,
            },
          },
          data: {
            constructionkitId: null,
          },
        });
        return NextResponse.json({
          success: true,
          pairedContent: {
            type: "Paired",
            id: pairedContent.id,
            name: pairedContent.contentName,
          },
        });
      }
    });
  } catch (error) {
    console.error("Error creating pair:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
