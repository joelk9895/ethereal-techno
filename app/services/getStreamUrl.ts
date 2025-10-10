import s3 from "../lib/storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function getStreamUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (!key) {
    throw new Error("File key is required");
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
  if (!bucketName) {
    throw new Error("AWS S3 bucket name is not defined");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL for streaming:", error);
    throw new Error("Failed to generate streaming URL");
  }
}
