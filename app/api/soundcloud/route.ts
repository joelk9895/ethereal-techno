import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        // Use SoundCloud OEmbed API
        const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl);

        if (!response.ok) {
            throw new Error(`SoundCloud API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("SoundCloud Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch track data" }, { status: 500 });
    }
}
