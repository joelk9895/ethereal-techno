import { NextRequest, NextResponse } from "next/server";
import { ApplicationStatus } from "@prisma/client";
import prisma from "@/app/lib/database";
import { verifyAdminAccess } from "@/lib/admin-auth";



// Get all applications
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status: status as ApplicationStatus } : {};

    const applications = await prisma.artistApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        applications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {

  }
}
