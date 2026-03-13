import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } // Await params here as appropriate for App Router Next 15+
) {
  try {
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: string | jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = decoded.userId;
    const resolvedParams = await params;
    const partnerId = resolvedParams.userId;

    if (!partnerId) {
      return NextResponse.json({ error: "Missing partner ID" }, { status: 400 });
    }

    // Fetch the chat history between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            artistPhoto: true,
            artistApplications: { where: { status: "APPROVED" }, take: 1, select: { artistName: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            artistPhoto: true,
            artistApplications: { where: { status: "APPROVED" }, take: 1, select: { artistName: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest to newest for chat
    });

    // Mark messages as read if they were sent BY the partner TO the current user and are unread
    const unreadMessageIds = messages
      .filter((msg) => msg.senderId === partnerId && !msg.isRead)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true },
      });
    }

    // Also fetch the partner's profile information so the frontend knows who the header is
    const partnerInfo = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        username: true,
        artistPhoto: true,
        artistApplications: { where: { status: "APPROVED" }, take: 1, select: { artistName: true } },
      },
    });

    return NextResponse.json({ messages, partner: partnerInfo }, { status: 200 });

  } catch (error) {
    console.error("Error fetching chat thread:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
