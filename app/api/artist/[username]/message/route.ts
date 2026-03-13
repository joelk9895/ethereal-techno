import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { sendArtistMessageEmail } from "@/app/services/emailService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> } // Await params here as appropriate for App Router Next 15+
) {
  try {
    // 1. Authenticate the Sender
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

    if (!decoded || typeof decoded === "string" || !decoded.userId || decoded.type !== "ARTIST") {
      return NextResponse.json({ error: "Only approved artists can send messages" }, { status: 403 });
    }

    // Await params resolving
    const resolvedParams = await params;
    const recipientUsername = resolvedParams.username;

    // 2. Parse the body
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // 3. Fetch recipient's data
    const recipientUser = await prisma.user.findUnique({
      where: { username: recipientUsername },
      include: {
        artistApplications: {
          where: { status: "APPROVED" },
          take: 1
        }
      }
    });

    if (!recipientUser || !recipientUser.artistApplications || recipientUser.artistApplications.length === 0) {
      return NextResponse.json({ error: "Recipient artist not found" }, { status: 404 });
    }

    const recipientEmail = recipientUser.email;
    const recipientArtistName = recipientUser.artistApplications[0].artistName;

    // 4. Fetch sender's data to get their artist name and username
    const senderUser = await prisma.user.findUnique({
      where: { id: (decoded as jwt.JwtPayload).userId },
      include: {
        artistApplications: {
          where: { status: "APPROVED" },
          take: 1
        }
      }
    });

    if (!senderUser || senderUser.type !== "ARTIST") {
      return NextResponse.json({ error: "Sender artist profile not found" }, { status: 403 });
    }

    const senderName = senderUser.artistApplications[0]?.artistName || senderUser.name;
    const senderUsername = senderUser.username;

    // 5. Send Email via Brevo
    const result = await sendArtistMessageEmail(
      recipientEmail, // Will go to their real email
      recipientArtistName, // Their display name
      senderName, // Our display name
      senderUsername, // username used for reply-to abstraction
      subject,
      message
    );

    if (!result.success) {
      console.error("Failed to route artist message:", result.error);
      return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }

    // 6. Persist Message to Database
    try {
      await prisma.message.create({
        data: {
          senderId: senderUser.id,
          receiverId: recipientUser.id,
          content: message, // We store the body. The email "subject" is just static in the UI but can be prepended if needed.
        }
      });
    } catch (dbError) {
      console.error("Failed to save message to database:", dbError);
      // We still return 200 because the email sent successfully
    }

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error sending artist message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
