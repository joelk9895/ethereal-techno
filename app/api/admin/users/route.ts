import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { sendAccountDeletionEmail, sendAdminNotification } from "@/app/services/emailService";

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        type: true,
        country: true,
        createdAt: true,
        approvedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE a user (admin kicks them out)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (userId === authResult.user!.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    // Fetch user before deletion for email notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting other admins
    if (user.type === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 403 });
    }

    // Delete related messages first (no cascade set)
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
    });

    // Delete the user (cascades handle sessions, risk logs, applications)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Send deletion email asynchronously
    void sendAccountDeletionEmail(user.email, user.name || user.username).catch((err) => {
      console.error("Failed to send account deletion email:", err);
    });

    return NextResponse.json({ success: true, message: `User ${user.username} has been removed.` });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
