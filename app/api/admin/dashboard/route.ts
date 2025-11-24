import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
}

interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  activeNews: number;
  totalNews: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: JWTPayload;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { type: true },
    });

    if (!user || user.type !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch stats
    const [
      totalUsers,
      totalApplications,
      activeNews,
      totalNews,
      applications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.artistApplication.count(),
      prisma.news.count({ where: { isActive: true } }),
      prisma.news.count(),
      prisma.artistApplication.findMany({
        select: { status: true },
      }),
    ]);

    const pendingApplications = applications.filter(
      (app) => app.status === "PENDING"
    ).length;
    const approvedApplications = applications.filter(
      (app) => app.status === "APPROVED"
    ).length;
    const rejectedApplications = applications.filter(
      (app) => app.status === "REJECTED"
    ).length;


    const stats: DashboardStats = {
      totalUsers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      activeNews,
      totalNews,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
