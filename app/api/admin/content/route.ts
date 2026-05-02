import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: JWTPayload;

        try {
            decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        } catch {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { type: true },
        });

        if (!user || user.type !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all imported content
        const contents = await prisma.content.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                file: true,
                metadata: true
            }
        });

        // Also fetch construction kits
        const kits = await prisma.constructionkit.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                metadata: true,
                contents: {
                    include: { file: true }
                }
            }
        });

        // Structure it nicely for the frontend selector
        return NextResponse.json({ contents, kits });

    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
    }
}
