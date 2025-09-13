import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/app/lib/storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET() {
  const contents = await prisma.content.findMany({
    include: {
      file: true,
    },
  });
  await Promise.all(
    contents.map(async (content) => {
      if (content.file) {
        const signedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: content.file.awsKey,
          }),
          { expiresIn: 3600 }
        );
        content.file.fileUrl = signedUrl;
      }
    })
  );
  return NextResponse.json(contents);
}
