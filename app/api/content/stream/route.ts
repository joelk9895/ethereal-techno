import { NextResponse } from "next/server";
import { getStreamUrl } from "@/app/services/getStreamUrl";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    const url = await getStreamUrl(key);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error: Error | unknown) {
    console.error("Error in stream endpoint:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate streaming URL" },
      { status: 500 }
    );
  }
}
