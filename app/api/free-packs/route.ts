import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-development-only";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        try {
            jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Fetch all construction kits marked as free for verified producers
        const freePacks = await prisma.constructionkit.findMany({
            where: {
                isFreeForVerified: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        artistName: true,
                    }
                },
                contents: {
                    select: {
                        file: {
                            select: {
                                awsKey: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Format the response to map to the frontend expectations
        const formattedPacks = freePacks.map((pack) => {
            // We will sum the mock filesizes or implement actual filesize tracking later if needed.
            // Also map standard s3 bucket url format if not strictly checking signature right here.
            // For downloads, we might want to track this in the DB, mock for now:
            const s3Key = pack.contents.length > 0 ? pack.contents[0].file.awsKey : "";

            return {
                id: pack.id,
                title: pack.kitName.replace(/_/g, " "), // Format title if it's snake case
                type: pack.category || "SAMPLE", // Default category if null
                artist: {
                    name: pack.user.name,
                    artistName: pack.user.artistName || pack.user.name,
                },
                fileSize: 1024 * 1024 * 50, // Mock 50mb
                downloads: 0, // Mock downloads
                s3Url: s3Key ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}` : "#",
                createdAt: pack.createdAt.toISOString(),
                artworkUrl: pack.artworkUrl,
                shortDescription: pack.shortDescription
            };
        });

        return NextResponse.json({
            success: true,
            packs: formattedPacks,
        });
    } catch (error) {
        console.error("Error fetching free packs:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
