import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const producers = await prisma.user.findMany({
            where: {
                type: "ARTIST",
                // We can add verification check here if needed, e.g. approvedAt: { not: null }
            },
            select: {
                id: true,
                artistName: true,
                username: true,
                artistPhoto: true,
                profileViews: true,
                messageClicks: true,
                city: true,
                country: true,
            },
        });

        // Sort by total interactions (views + clicks) descending
        const sortedProducers = producers.sort((a, b) => {
            const scoreA = (a.profileViews || 0) + (a.messageClicks || 0);
            const scoreB = (b.profileViews || 0) + (b.messageClicks || 0);
            return scoreB - scoreA;
        });

        // Transform S3 URLs to use image proxy
        const producersWithSignedUrls = sortedProducers.map(producer => {
            let signedPhotoUrl = producer.artistPhoto;

            if (signedPhotoUrl && (signedPhotoUrl.includes("amazonaws.com") || signedPhotoUrl.includes("artist-applications/"))) {
                try {
                    let key = signedPhotoUrl;
                    if (signedPhotoUrl.startsWith("http")) {
                        const urlObj = new URL(signedPhotoUrl);
                        key = decodeURIComponent(urlObj.pathname.substring(1)); // Remove leading slash
                    }
                    // If successfully extracted key or it was already a key
                    if (key) {
                        signedPhotoUrl = `/api/image-proxy?key=${encodeURIComponent(key)}`;
                    }
                } catch (e) {
                    console.error("Error parsing photo URL for proxy:", e);
                }
            }

            return {
                ...producer,
                artistPhoto: signedPhotoUrl
            };
        });

        return NextResponse.json({ producers: producersWithSignedUrls });
    } catch (error) {
        console.error("Error fetching producers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
