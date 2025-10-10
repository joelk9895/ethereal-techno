import { NextResponse } from "next/server";
import s3 from "@/app/lib/storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

const s3Client = s3;
const bucket = process.env.AWS_S3_BUCKET_NAME || "";
const region = process.env.AWS_REGION || "us-east-1";

const fileSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const requestSchema = z.object({
  files: z.array(fileSchema),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const { id } = paramsResolved;
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { files } = result.data;
    const presignedData = await Promise.all(
      files.map(async ({ filename, contentType }) => {
        const key = `${id}/${filename}`;
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
        });

        const presignedUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          presignedUrl,
          key,
          url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
          filename,
        };
      })
    );

    return NextResponse.json({ uploads: presignedData });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URLs" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
