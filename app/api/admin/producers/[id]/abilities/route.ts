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

interface UpdateAbilitiesBody {
  canCreateSamples?: boolean;
  canCreateSerum?: boolean;
  canCreateDiva?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { type: true },
    });

    if (!admin || admin.type !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const body = (await request.json()) as UpdateAbilitiesBody;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        canCreateSamples: body.canCreateSamples,
        canCreateSerum: body.canCreateSerum,
        canCreateDiva: body.canCreateDiva,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
