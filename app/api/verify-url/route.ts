import { NextRequest, NextResponse } from "next/server";

// Known platform patterns — these sites block server-side fetches,
// so we validate them by URL structure instead of HTTP response.
const KNOWN_PLATFORMS: { name: string; pattern: RegExp }[] = [
    { name: "SoundCloud", pattern: /^https?:\/\/(www\.)?soundcloud\.com\/.+/i },
    { name: "Instagram", pattern: /^https?:\/\/(www\.)?instagram\.com\/.+/i },
    { name: "TikTok", pattern: /^https?:\/\/(www\.)?tiktok\.com\/@.+/i },
    { name: "Spotify", pattern: /^https?:\/\/(open\.)?spotify\.com\/.+/i },
    { name: "Apple Music", pattern: /^https?:\/\/music\.apple\.com\/.+/i },
    { name: "YouTube", pattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i },
    { name: "Facebook", pattern: /^https?:\/\/(www\.)?facebook\.com\/.+/i },
    { name: "Beatport", pattern: /^https?:\/\/(www\.)?beatport\.com\/.+/i },
    { name: "Bandcamp", pattern: /^https?:\/\/[a-zA-Z0-9-]+\.bandcamp\.com/i },
    { name: "Linktree", pattern: /^https?:\/\/(www\.)?linktr\.ee\/.+/i },
    { name: "X (Twitter)", pattern: /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/.+/i },
];

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
            parsedUrl = new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        // Must be http or https
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
        }

        // Check if URL matches a known platform that blocks server-side fetches
        const knownPlatform = KNOWN_PLATFORMS.find(p => p.pattern.test(url));
        if (knownPlatform) {
            return NextResponse.json({
                valid: true,
                title: knownPlatform.name
            });
        }

        // For unknown domains, attempt an HTTP fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                signal: controller.signal,
                redirect: "follow"
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return NextResponse.json({
                    valid: false,
                    error: `URL returned status ${response.status}`
                }, { status: 200 });
            }

            const html = await response.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : null;

            return NextResponse.json({
                valid: true,
                title: title
            });

        } catch {
            clearTimeout(timeoutId);
            return NextResponse.json({
                valid: false,
                error: "Could not reach the URL (Timeout or Network Error)"
            }, { status: 200 });
        }

    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
