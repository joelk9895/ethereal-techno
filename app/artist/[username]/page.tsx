import prisma from "@/app/lib/database";
import { notFound } from "next/navigation";
import { Metadata } from "next";



interface PageProps {
    params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { username } = await params;
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            artistApplications: {
                where: { status: "APPROVED" },
                take: 1,
            },
        },
    });

    if (!user || user.type !== "ARTIST") {
        return {
            title: "Artist Not Found | Ethereal Techno",
        };
    }

    const artistData = user.artistApplications[0];
    const artistName = artistData?.artistName || user.name;

    return {
        title: `${artistName} | Ethereal Techno Artist`,
        description: `Official profile of ${artistName} on Ethereal Techno.`,
    };
}

import ArtistProfileContent from "./components/ArtistProfileContent";

export default async function ArtistProfilePage({ params }: PageProps) {
    const { username } = await params;

    // Fetch user and approved application
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            artistApplications: {
                where: { status: "APPROVED" },
                take: 1,
            },
        },
    });


    // 404 if not found or not an artist
    if (!user || user.type !== "ARTIST") {
        notFound();
    }

    const profile = user.artistApplications[0];

    // Resolve S3 URL if photoUrl exists: Use photoKey if available, else fallback to photoUrl extraction
    let signedPhotoUrl = profile?.photoKey || profile?.photoUrl;

    if (signedPhotoUrl) {
        try {
            let key = signedPhotoUrl;

            // Check if it's a full URL and extract key
            if (signedPhotoUrl.startsWith("http")) {
                try {
                    const urlObj = new URL(signedPhotoUrl);
                    // Extract key: path excluding leading slash. decodeURIComponent to handle formatted URLs
                    key = decodeURIComponent(urlObj.pathname.substring(1));
                } catch (e) {
                    console.error("Error parsing URL:", e);
                }
            } else {
                // Ensure key is decoded if it was stored with encodings
                key = decodeURIComponent(key);
            }

            // Only sign if we have a key (and it looks like a key, not a public external URL)
            if (key && !key.startsWith("http")) {
                // Use local proxy to allow Next.js Image Optimization to work efficiently
                // Next.js will cache the image based on this URL, sparing S3 bandwidth from repeated fetches
                signedPhotoUrl = `/api/image-proxy?key=${encodeURIComponent(key)}`;
            }
        } catch (error) {
            console.error("Failed to parse photo URL for proxy", error);
            // Fallback: keep original (likely won't load if it needs signing, but safe fallback)
        }
    }

    // Pass the potentially updated URL as part of a new object or override
    const profileWithSignedUrl = {
        ...profile,
        photoUrl: signedPhotoUrl
    };

    return (
        <ArtistProfileContent
            profile={profileWithSignedUrl}
            user={user}
            username={username}
        />
    );
}
