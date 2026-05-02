import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
  userId: string;
}

export async function POST(req: NextRequest) {
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
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, type: true }
        });

        if (!user || user.type !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { 
            title, 
            subtitle, 
            price, 
            description, 
            tags, 
            specs, 
            tracks, 
            defaultFullLoopId,
            artworkUrl,
            artworkKey,
            boxCoverUrl,
            boxCoverKey,
            demoAudioUrls,
            demoAudioKeys,
            demoAudioNames,
            isEssential
        } = body;

        if (!title || !price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Create the new Product model entry
        const newProduct = await prisma.product.create({
            data: {
                title,
                subtitle,
                description,
                price: parseFloat(price),
                artworkUrl,
                artworkKey,
                boxCoverUrl,
                boxCoverKey,
                demoAudioUrls: demoAudioUrls || [],
                demoAudioKeys: demoAudioKeys || [],
                demoAudioNames: demoAudioNames || [],
                tags: tags || [],
                specs: specs || [],
                status: "APPROVED",
                isEssential: isEssential || false,
                userId: user.id,
                defaultFullLoopId: defaultFullLoopId,
                contentIds: tracks || []
            },
            include: {
                contents: {
                    include: {
                        file: true,
                        metadata: true
                    }
                }
            }
        });

        return NextResponse.json(newProduct);

    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
