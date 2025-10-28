import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id: contentId } = paramsResolved;
    const body = await req.json();
    const { category, type } = body;

    if (!contentId || !category || !type) {
      return NextResponse.json(
        { error: "Missing required fields: contentId, category, type" },
        { status: 400 }
      );
    }

    const typeParts = type.split(" > ");
    const isMidi = category === "MIDI";
    const soundGroup = isMidi ? type : typeParts[0] || "Default";
    const subGroup = isMidi ? "" : typeParts[1] || "Default";

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
