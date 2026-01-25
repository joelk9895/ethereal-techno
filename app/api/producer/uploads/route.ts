import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface JWTPayload {
    userId: string;
    iat?: number;
    exp?: number;
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let userId: string;

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
            userId = decoded.userId;
        } catch {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        // specific content types that are "roots" or bundles
        // 1. Standalone samples (Content where contentType != 'Preset File' AND not part of a bundle?)
        // Actually, everything is in Content table or specific bundle tables.
        // Let's fetch from the specific high-level tables first to get "Bundles"
        // Then fetch standalone content.

        const [kits, loopsAndMidis, presets, looseContent] = await Promise.all([
            // Construction Kits
            prisma.constructionkit.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    kitName: true,
                    createdAt: true,
                    status: true,
                }
            }),
            // Loop & Midi Bundles
            prisma.loopandmidi.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    status: true,
                }
            }),
            // Presets
            prisma.preset.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    status: true,
                }
            }),
            // Standalone Content (Samples, One-Shots that are NOT part of the above)
            // This is tricky because content is linked to the above.
            // We should query Content where it's NOT linked to a bundle. 
            // But our schema links are optional.
            // A safe bet is to query content that has userId, and filter out those that are used.
            // Or simply: Content table holds "One-Shots" and "Loops" primarily. 
            // If we uploaded a "Loop+MIDI", we created a Loopandmidi record AND 2 Content records.
            // We only want to show the Loopandmidi record in the dashboard (the bundle).
            // So we should ignore Content that is linked to Loopandmidi or Preset.
            prisma.content.findMany({
                where: {
                    userId,
                    // Not part of a kit
                    constructionkitId: null,
                    // Not part of a loop/midi bundle (as loop or midi)
                    loopandmidiLoop: { none: {} },
                    loopandmidiMidi: { none: {} },
                    // Not part of a preset (as loop, midi or preset file)
                    presetLoop: { none: {} },
                    presetMidi: { none: {} },
                    presetContent: { none: {} },
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    contentName: true,
                    contentType: true,
                    createdAt: true,
                    status: true,
                }
            })
        ]);

        const formattedUploads = [
            ...kits.map(k => ({
                id: k.id,
                title: k.kitName,
                type: "Construction Kit",
                status: k.status,
                date: k.createdAt.toISOString().split('T')[0],
                size: "Unknown" // We don't track size in DB easily yet
            })),
            ...loopsAndMidis.map(l => ({
                id: l.id,
                title: l.name,
                type: "Loop & MIDI",
                status: l.status,
                date: l.createdAt.toISOString().split('T')[0],
                size: "Unknown"
            })),
            ...presets.map(p => ({
                id: p.id,
                title: p.name,
                type: "Preset Bundle",
                status: p.status,
                date: p.createdAt.toISOString().split('T')[0],
                size: "Unknown"
            })),
            ...looseContent.map(c => ({
                id: c.id,
                title: c.contentName,
                type: c.contentType,
                status: c.status,
                date: c.createdAt.toISOString().split('T')[0],
                size: "Unknown"
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ uploads: formattedUploads });

    } catch (error) {
        console.error("Error fetching producer uploads:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
