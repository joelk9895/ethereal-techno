import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Validate URL format again on server side just in case
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        // Fetch the URL with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; EtherealTechnoBot/1.0; +https://ethereal-techno.com)"
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return NextResponse.json({
                    valid: false,
                    error: `URL returned status ${response.status}`
                }, { status: 200 }); // Return 200 so frontend can handle the "invalid" logic gracefully
            }

            const html = await response.text();

            // Simple regex to extract title
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch ? titleMatch[1].trim() : null;

            return NextResponse.json({
                valid: true,
                title: title
            });

        } catch {
            // fetchError ignored
            clearTimeout(timeoutId);
            return NextResponse.json({
                valid: false,
                error: "Could not reach the URL (Timeout or Network Error)"
            }, { status: 200 });
        }

    } catch {
        // error ignored
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
