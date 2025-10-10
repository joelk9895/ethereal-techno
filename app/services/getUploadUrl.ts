import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "@/app/lib/storage";
import { v4 as uuidv4 } from "uuid";

interface getUploadUrlParams {
  filename?: string;
  filetype?: string;
  expiresIn?: number;
}

export default async function getUploadUrl(params: getUploadUrlParams) {
  const id = uuidv4();
  const fileCategory = params.filetype
    ? params.filetype.split("/")[0]
    : "unknown";

  const key = `uploads/${fileCategory}/${id}_${params.filename || id}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: params.expiresIn || 3600,
  });

  return { uploadUrl, key };
}
