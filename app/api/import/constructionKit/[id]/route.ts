import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { getStreamUrl } from "@/app/services/getStreamUrl";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id } = paramsResolved;
    const body = await req.json();
    const { files, defaultFullLoopFileName } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Request must contain a 'files' array" },
        { status: 400 }
      );
    }

    // Validate all files have required fields
    for (const file of files) {
      if (
        !file.fileName ||
        !file.category ||
        !file.type ||
        !file.key ||
        !file.url
      ) {
        return NextResponse.json(
          {
            error: "Each file must have fileName, category, type, key, and url",
          },
          { status: 400 }
        );
      }
    }

    // Single transaction for all files
    const result = await prisma.$transaction(
      async (tx) => {
        // Ensure construction kit exists or will be created
        let kit = await tx.constructionkit.findUnique({
          where: { id },
        });

        // First, ensure a default user exists
        let user = await tx.user.findFirst({
          where: { email: "default@example.com" },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              email: "default@example.com",
              name: "Default User",
              username: "defaultuser",
              password: "defaultpassword",
            },
          });
        }

        // Create metadata
        let metadata = await tx.metadata.findUnique({
          where: { id },
        });

        if (!metadata) {
          metadata = await tx.metadata.create({
            data: { id },
          });
        }

        // Create all content records first
        const createdContents = [];
        let defaultFullLoopId: string | null = null;

        for (const file of files) {
          const { fileName, category, type, key, url } = file;

          const isMidi = category === "MIDI";
          const typeParts = type.split(" > ");
          const soundGroup = isMidi ? type : typeParts[0] || "Default";
          const subGroup = isMidi ? "" : typeParts[1] || "Default";

          // Create the file record first
          const createdFile = await tx.file.create({
            data: {
              awsKey: key,
              fileName: fileName,
            },
          });

          const content = await tx.content.create({
            data: {
              contentName: fileName,
              contentType: category,
              soundGroup,
              subGroup,
              metadata: {
                connect: { id: metadata.id },
              },
              file: {
                connect: { id: createdFile.id },
              },
            },
          });

          createdContents.push(content);

          // Track the default full loop if it's in the current batch
          if (
            defaultFullLoopFileName &&
            fileName === defaultFullLoopFileName &&
            category === "Full Loop"
          ) {
            defaultFullLoopId = content.id;
          }
        }

        // If no specific default was passed for the new files, use the first one found
        if (!defaultFullLoopId) {
          const firstFullLoop = createdContents.find(
            (c) => c.contentType === "Full Loop"
          );
          if (firstFullLoop) {
            defaultFullLoopId = firstFullLoop.id;
          }
        }

        // If we are creating a NEW kit, a default full loop MUST be in this batch.
        if (!kit && !defaultFullLoopId) {
          throw new Error(
            "A new construction kit must be created with at least one 'Full Loop'."
          );
        }

        if (!kit) {
          // This can only be reached if defaultFullLoopId is set
          kit = await tx.constructionkit.create({
            data: {
              id,
              kitName: id,
              defaultFullLoop: {
                connect: { id: defaultFullLoopId! }, // Non-null assertion is safe here
              },
              metadata: {
                connect: { id: metadata.id },
              },
              user: {
                connect: { id: user.id },
              },
              contents: {
                connect: createdContents.map((c) => ({ id: c.id })),
              },
            },
          });
        } else {
          // Update existing kit by connecting the new content
          kit = await tx.constructionkit.update({
            where: { id },
            data: {
              // Only update the default loop if a new one is being set
              ...(defaultFullLoopId && {
                defaultFullLoop: {
                  connect: { id: defaultFullLoopId },
                },
              }),
              contents: {
                // This connects the new content without disconnecting the old content
                connect: createdContents.map((c) => ({ id: c.id })),
              },
            },
          });
        }

        return kit;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    return NextResponse.json({
      success: true,
      message: `${files.length} files added to construction kit`,
      data: result,
    });
  } catch (error) {
    console.error("Error adding files to construction kit:", error);
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
            file: true, // Ensure the related file with awsKey is included
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

    const contentsWithStreamUrls = await Promise.all(
      constructionKit.contents.map(async (content) => {
        const isAudio =
          content.contentType === "Sample Loop" ||
          content.contentType === "One-Shot" ||
          content.contentType === "Full Loop";

        if (isAudio && content.file?.awsKey) {
          try {
            const streamUrl = await getStreamUrl(content.file.awsKey);
            return { ...content, streamUrl };
          } catch (error) {
            console.error(
              `Failed to get stream URL for key ${content.file.awsKey}:`,
              error
            );
            return { ...content, streamUrl: null };
          }
        }
        return { ...content, streamUrl: null };
      })
    );

    const kitWithUrls = {
      ...constructionKit,
      contents: contentsWithStreamUrls,
    };

    return NextResponse.json(kitWithUrls, { status: 200 });
  } catch (error) {
    console.error("Error fetching construction kit:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id } = paramsResolved;
    const body = await req.json();
    const { defaultFullLoopIdentifier } = body;

    if (!defaultFullLoopIdentifier) {
      return NextResponse.json(
        { error: "Default full loop identifier is required" },
        { status: 400 }
      );
    }

    // Update the construction kit with the new default full loop
    const result = await prisma.$transaction(async (tx) => {
      // Check if identifier is a content ID or filename
      let defaultFullLoopContent;

      if (
        defaultFullLoopIdentifier.includes("-") &&
        defaultFullLoopIdentifier.length === 36
      ) {
        // It's a UUID (content ID)
        defaultFullLoopContent = await tx.content.findUnique({
          where: { id: defaultFullLoopIdentifier },
        });
      } else {
        // It's a filename, find by name in this construction kit
        const kit = await tx.constructionkit.findUnique({
          where: { id },
          include: { contents: true },
        });

        defaultFullLoopContent = kit?.contents.find(
          (c) =>
            c.contentName === defaultFullLoopIdentifier &&
            c.contentType === "Full Loop"
        );
      }

      if (!defaultFullLoopContent) {
        throw new Error("Default full loop not found");
      }

      // Update the construction kit
      const updatedKit = await tx.constructionkit.update({
        where: { id },
        data: {
          defaultFullLoop: {
            connect: { id: defaultFullLoopContent.id },
          },
        },
      });

      return updatedKit;
    });

    return NextResponse.json({
      success: true,
      message: "Construction kit updated successfully",
      data: result,
    });
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
        // First, delete records that depend on the construction kit
        await tx.preset.deleteMany({
          where: { constructionkitId: id },
        });

        await tx.loopandmidi.deleteMany({
          where: { constructionkitId: id },
        });

        // Now, delete the construction kit itself. This removes the foreign key
        // constraint on the Content model for the 'defaultFullLoop'.
        await tx.constructionkit.delete({
          where: { id },
        });

        // With the construction kit gone, we can safely delete the content and files.
        const contentIds = existingKit.contents.map((content) => content.id);
        const fileIds = existingKit.contents
          .map((content) => content.fileId)
          .filter((fileId): fileId is string => !!fileId);

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

        // Finally, delete the associated metadata if it exists
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
