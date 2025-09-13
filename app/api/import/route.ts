import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import s3 from "@/app/lib/storage";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const id = uuidv4();
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const contentType = formData.get("contentType");
    const contentName = formData.get("contentName");
    const bpm = formData.get("bpm");
    const key = formData.get("key");
    const soundGroup = formData.get("soundGroup");
    const subGroup = formData.get("subGroup");
    const styles = JSON.parse(formData.get("styles") as string);
    const moods = JSON.parse(formData.get("moods") as string);
    const processing = formData.get("processing");
    const soundDesign = formData.get("soundDesign");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/${id}_${file.name}`,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    const newContent = await prisma.content.create({
      data: {
        contentName: contentName as string,
        contentType: contentType as string,
        bpm: bpm as string,
        key: key as string,
        soundGroup: soundGroup as string,
        subGroup: subGroup as string,
        styles: styles as string[],
        moods: moods as string[],
        processing: processing
          ? Array.isArray(processing)
            ? processing
            : [processing as string]
          : undefined,
        soundDesign: soundDesign
          ? Array.isArray(soundDesign)
            ? soundDesign
            : [soundDesign as string]
          : undefined,
        file: {
          create: {
            fileName: file.name,
            fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${id}_${file.name}`,
            awsKey: `uploads/${id}_${file.name}`,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Content imported successfully", content: newContent },
      { status: 201 }
    );
  } catch (error: Error | unknown) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
