import { NextRequest, NextResponse } from "next/server";
import { getStreamUrl } from "@/app/services/getStreamUrl";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Security check: Only allow access to artist application content for now
    // Adjust this prefix based on where public profile images are stored
    if (!key.startsWith("artist-applications/")) {
        // Return 403 default, or 404 to hide existence
        console.warn(`Blocked access to restricted key: ${key}`);
        return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    try {
        const url = await getStreamUrl(key);

        // Fetch the image from S3
        const imageResponse = await fetch(url);

        if (!imageResponse.ok) {
            console.error(`S3 Fetch Error: ${imageResponse.status} ${imageResponse.statusText}`);
            return NextResponse.json({ error: "Failed to fetch image from storage" }, { status: 502 });
        }

        const contentType = imageResponse.headers.get("content-type") || "application/octet-stream";
        const arrayBuffer = await imageResponse.arrayBuffer();

        // Return the image data directly
        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable", // Cache heavily
            },
        });

    } catch (error) {
        console.error("Error generating proxy URL:", error);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
