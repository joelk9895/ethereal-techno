import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET() {
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

    // Fetch all messages involving this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
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
      orderBy: { createdAt: "desc" },
    });

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const isSender = msg.senderId === currentUserId;
      const partnerId = isSender ? msg.receiverId : msg.senderId;
      const partner = isSender ? msg.receiver : msg.sender;

      // Only store the latest message for the thread list
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          userId: partnerId,
          username: partner.username,
          artistName: partner.artistApplications[0]?.artistName || partner.username,
          artistPhoto: partner.artistPhoto,
          latestMessage: msg.content,
          latestMessageAt: msg.createdAt,
          isRead: isSender ? true : msg.isRead, // If current user sent the latest, it's inherently read by them
          unreadCount: 0,
        });
      }

      // Increment unread count if we received this message and haven't read it
      if (!isSender && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    conversations.sort((a, b) => new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
