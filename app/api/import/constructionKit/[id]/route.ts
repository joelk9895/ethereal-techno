import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/database";
import { Prisma } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id } = paramsResolved;
    const body = await req.json();
    const { fileName, category, type, key, url } = body;

    if (!fileName || !category || !type || !key || !url) {
      return NextResponse.json(
        { error: "Missing required fields", received: body },
        { status: 400 }
      );
    }

    // Use upsert pattern to handle concurrent creation attempts
    const result = await prisma.$transaction(
      async (tx) => {
        // First, try to find or create the construction kit outside the main transaction logic
        let kit = await tx.constructionkit.findUnique({
          where: { id },
        });

        if (!kit) {
          try {
            // Try to create metadata first
            const metadata = await tx.metadata.upsert({
              where: { id },
              update: {},
              create: {
                id,
                bpm: null,
                key: null,
                styles: [],
                moods: [],
              },
            });

            // Try to create the construction kit
            kit = await tx.constructionkit.upsert({
              where: { id },
              update: {},
              create: {
                id,
                kitName: id,
                description: "",
                metadataId: metadata.id,
                userId: "default",
              },
            });
          } catch (error) {
            // If creation fails due to race condition, try to find the existing kit
            kit = await tx.constructionkit.findUnique({
              where: { id },
            });

            if (!kit) {
              throw error; // Re-throw if we still can't find it
            }
          }
        }

        // Proceed with file and content creation
        const file = await tx.file.create({
          data: {
            fileName,
            awsKey: key,
          },
        });

        const typeParts = type.split(" > ");
        const soundGroup = typeParts[0] || "Default";
        const subGroup = typeParts[1] || "Default";

        const content = await tx.content.create({
          data: {
            contentType: category,
            contentName: fileName,
            soundGroup,
            subGroup,
            metadataId: id,
            fileId: file.id,
          },
        });

        // Update the construction kit to include the new content
        await tx.constructionkit.update({
          where: { id },
          data: {
            contents: {
              connect: { id: content.id },
            },
          },
        });

        return { file, content, kit };
      },
      {
        maxWait: 15000, // Increased wait time
        timeout: 20000, // Increased timeout
      }
    );

    return NextResponse.json({
      success: true,
      message: "File added to construction kit",
      data: result,
    });
  } catch (error) {
    console.error("Error adding file to construction kit:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        {
          error: "Transaction conflict, please retry",
          code: "RETRY_REQUIRED",
          details: "Multiple requests are being processed simultaneously",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const constructionKit = await prisma.constructionkit.findUnique({
      where: { id },
      include: {
        contents: {
          include: {
            file: true,
          },
        },
        metadata: true,
        presets: {
          include: {
            loopContent: {
              include: { file: true },
            },
            midiContent: {
              include: { file: true },
            },
            presetContent: {
              include: { file: true },
            },
          },
        },
        loopAndMidis: {
          include: {
            loopContent: {
              include: { file: true },
            },
            midiContent: {
              include: { file: true },
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

    if (!constructionKit.metadata) {
      return NextResponse.json(
        { error: "Construction kit metadata missing" },
        { status: 400 }
      );
    }

    return NextResponse.json(constructionKit, { status: 200 });
  } catch (error) {
    console.error("Error fetching construction kit:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
) {
  try {
    const body = await req.json();
    const { contentId, category, type } = body;

    if (!contentId || !category || !type) {
      return NextResponse.json(
        { error: "Missing required fields: contentId, category, type" },
        { status: 400 }
      );
    }

    const typeParts = type.split(" > ");
    const soundGroup = typeParts[0] || "Default";
    const subGroup = typeParts[1] || "Default";

    const result = await prisma.content.update({
      where: { id: contentId },
      data: {
        contentType: category,
        soundGroup,
        subGroup,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id } = paramsResolved;

    const existingKit = await prisma.constructionkit.findUnique({
      where: { id },
      include: {
        contents: {
          include: {
            file: true,
          },
        },
        metadata: true,
        presets: true,
        loopAndMidis: true,
      },
    });

    if (!existingKit) {
      return NextResponse.json(
        { error: "Construction kit not found" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        await tx.preset.deleteMany({
          where: { constructionkitId: id },
        });

        await tx.loopandmidi.deleteMany({
          where: { constructionkitId: id },
        });

        const contentIds = existingKit.contents.map((content) => content.id);
        const fileIds = existingKit.contents.map((content) => content.fileId);

        if (contentIds.length > 0) {
          await tx.content.deleteMany({
            where: {
              id: {
                in: contentIds,
              },
            },
          });
        }

        if (fileIds.length > 0) {
          await tx.file.deleteMany({
            where: {
              id: {
                in: fileIds,
              },
            },
          });
        }

        await tx.constructionkit.delete({
          where: { id },
        });

        if (existingKit.metadataId) {
          await tx.metadata.delete({
            where: { id: existingKit.metadataId },
          });
        }

        return {
          deletedContents: contentIds.length,
          deletedFiles: fileIds.length,
          deletedPresets: existingKit.presets.length,
          deletedPairs: existingKit.loopAndMidis.length,
        };
      },
      {
        maxWait: 25000,
        timeout: 30000,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Construction kit and all related data deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting construction kit:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
