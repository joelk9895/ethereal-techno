import { NextRequest, NextResponse } from "next/server";
import { uploadFileToS3 } from "@/app/services/uploadToS3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No photo provided" },
        { status: 400 }
      );
    }

    // Upload to S3
    const { url, key } = await uploadFileToS3(file, "artist-applications");

    return NextResponse.json({ photoUrl: url, photoKey: key });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
}
