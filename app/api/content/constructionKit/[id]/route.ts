import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export async function GET(request: Request) {
  const pathSegments = new URL(request.url).pathname.split("/");
  const id = pathSegments[pathSegments.length - 1];

  const result = await prisma.constructionkit.findUnique({
    where: { id },
    include: {
      contents: {
        include: { file: true },
      },
    },
  });

  return NextResponse.json({ contents: result || [] });
}
