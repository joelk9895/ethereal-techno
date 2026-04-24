import { NextRequest, NextResponse } from "next/server";
import { UserType } from "@prisma/client";
import prisma from "@/app/lib/database";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const producers = await prisma.user.findMany({
      where: {
        type: UserType.ARTIST,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        type: true,
        country: true,
        artistName: true,
        createdAt: true,
        approvedAt: true,
        canCreateSamples: true,
        canCreateSerum: true,
        canCreateDiva: true,
        _count: {
          select: { artistApplications: true },
        },
        artistApplications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            artistName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Flatten the latestApplication from the array
    const formatted = producers.map((p) => ({
      ...p,
      latestApplication: p.artistApplications[0] || null,
      artistApplications: undefined,
    }));

    return NextResponse.json({ producers: formatted });
  } catch (error) {
    console.error("Producers fetch error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
