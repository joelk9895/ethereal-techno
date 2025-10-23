import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";

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
