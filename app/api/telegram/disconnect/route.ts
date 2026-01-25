import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { telegramService } from "@/app/services/telegramService";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { telegramChatId: true }
        });

        if (user?.telegramChatId) {
            // Kick from group
            await telegramService.kickUser(user.telegramChatId);
        }

        // Remove from DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                telegramChatId: null,
                telegramConnectionToken: null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error connecting Telegram:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
