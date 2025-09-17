import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/app/lib/storage";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${uuidv4()}`,
    })
  );
  return NextResponse.json({ message: "Content upload endpoint", url });
}
