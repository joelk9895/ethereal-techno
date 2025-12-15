import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";



export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        priority: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 10, // Limit to 10 most recent/important news items
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error("Public news fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {

  }
}
