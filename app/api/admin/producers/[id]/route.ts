import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { verifyAdminAccess } from "@/lib/admin-auth";

// PATCH — Dismiss producer (demote to USER)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id: producerId } = await params;
    const body = await request.json();

    // If dismissing from producer status
    if (body.action === "dismiss") {
      const producer = await prisma.user.findUnique({
        where: { id: producerId },
        select: { id: true, type: true, username: true, artistName: true },
      });

      if (!producer) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (producer.type !== "ARTIST") {
        return NextResponse.json({ error: "User is not a producer" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: producerId },
        data: {
          type: "USER",
          approvedAt: null,
          canCreateSamples: false,
          canCreateSerum: false,
          canCreateDiva: false,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${producer.artistName || producer.username} has been dismissed from producer status.`,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Producer action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
