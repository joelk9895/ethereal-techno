import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "@/app/lib/storage";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

interface UploadParams {
  filename: string;
  filetype: string;
  expiresIn?: number;
}

export default async function getUploadUrl({
  filename,
  filetype,
  expiresIn = 3600,
}: UploadParams) {
  const key = `uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: filetype,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn,
  });

  return { uploadUrl, key };
}

export async function uploadFileToS3(
  file: File,
  folder: string = "uploads"
): Promise<{ url: string; key: string }> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${Date.now()}-${file.name}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key };
}
