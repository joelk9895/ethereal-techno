import { NextResponse, NextRequest } from "next/server";
import prisma from "@/app/lib/database";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { producerId, interactionType } = body;

        if (!producerId || !interactionType) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (interactionType === 'view') {
            await prisma.user.update({
                where: { id: producerId },
                data: { profileViews: { increment: 1 } }
            });
        } else if (interactionType === 'click') {
            await prisma.user.update({
                where: { id: producerId },
                data: { messageClicks: { increment: 1 } }
            });
        } else {
            return NextResponse.json({ error: "Invalid interaction type" }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error tracking interaction:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
