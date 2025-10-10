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

    const existingKit = await prisma.constructionkit.findUnique({
      where: { id },
    });

    if (!existingKit) {
      try {
        await prisma.constructionkit.create({
          data: {
            id,
            kitName: id,
            description: "",
            metadataId: id,
            userId: "default",
          },
        });
      } catch (e) {
        if (
          !(
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
          )
        ) {
          throw e;
        }
      }
    }

    const result = await prisma.$transaction(
      async (tx) => {
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

        await tx.constructionkit.update({
          where: { id },
          data: {
            contents: {
              connect: { id: content.id },
            },
          },
        });

        return { file, content };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    return NextResponse.json({
      success: true,
      message: "File added to construction kit",
      data: result,
    });
  } catch (error) {
    console.error("Error adding file to construction kit:", error);
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
