import { NextRequest, NextResponse } from "next/server";
import getUploadUrl from "@/app/services/getUploadUrl";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { fileName, fileType } = data;

  if (!fileName || !fileType) {
    return NextResponse.json(
      { error: "Filename and filetype are required" },
      { status: 400 }
    );
  }

  try {
    const { uploadUrl, key } = await getUploadUrl({
      filename: fileName,
      filetype: fileType,
      expiresIn: 3600,
    });

    return NextResponse.json({ uploadUrl, key: key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
