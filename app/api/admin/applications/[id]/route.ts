import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdminAccess } from "@/lib/admin-auth";

const prisma = new PrismaClient();

// Get single application
export async function GET(
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

    const { id } = await params;

    const application = await prisma.artistApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            surname: true,
            createdAt: true,
            type: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Update application status
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

    const { id } = await params;

    const body = await request.json();
    const {
      status,
      reviewNotes,
      criteriaStyle,
      criteriaQuality,
      criteriaPresentation,
      criteriaStatement,
    } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the application
    const application = await prisma.artistApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application
    const updatedApplication = await prisma.artistApplication.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
        reviewedBy: authResult.user?.email || null,
        criteriaStyle: criteriaStyle || null,
        criteriaQuality: criteriaQuality || null,
        criteriaPresentation: criteriaPresentation || null,
        criteriaStatement: criteriaStatement || null,
      },
    });

    // If approved, upgrade user to ARTIST and set abilities
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          type: "ARTIST",
          approvedAt: new Date(),
          canCreateSamples: application.canCreateLoops,
          canCreateSerum: application.canCreateSerum,
          canCreateDiva: application.canCreateDiva,
        },
      });
    }

    // TODO: Send email based on decision and criteria

    return NextResponse.json(
      {
        message: "Application updated successfully",
        application: updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
