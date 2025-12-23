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

            if (signedPhotoUrl.startsWith("http")) {
                try {
                    const urlObj = new URL(signedPhotoUrl);
                    key = decodeURIComponent(urlObj.pathname.substring(1));
                } catch (e) {
                    console.error("Error parsing URL:", e);
                }
            } else {
                key = decodeURIComponent(key);
            }

            if (key && !key.startsWith("http")) {
                signedPhotoUrl = `/api/image-proxy?key=${encodeURIComponent(key)}`;
            }
        } catch (error) {
            console.error("Failed to parse photo URL for proxy", error);
        }
    }

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
