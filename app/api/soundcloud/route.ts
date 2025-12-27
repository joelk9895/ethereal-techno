import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        // Use SoundCloud OEmbed API with a real browser User-Agent to avoid WAF
        const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
        const response = await fetch(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const text = await response.text();

        if (!response.ok) {
            console.error(`SoundCloud API error (${response.status}):`, text);
            return NextResponse.json({ error: `SoundCloud API error: ${response.statusText}` }, { status: response.status });
        }

        if (!text) {
            console.error("SoundCloud API returned empty response w/ status", response.status);
            return NextResponse.json({ error: "SoundCloud returned empty response" }, { status: 502 });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch (jsonError) {
            console.error("Failed to parse SoundCloud response:", text);
            return NextResponse.json({ error: "Invalid response from SoundCloud" }, { status: 502 });
        }

    } catch (error) {
        console.error("SoundCloud Proxy Error:", error);
        return NextResponse.json({ error: "Failed to fetch track data" }, { status: 500 });
    }
}
