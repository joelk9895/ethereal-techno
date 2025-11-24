import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export async function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 };
  }

  const token = authHeader.substring(7);
  let decoded: JWTPayload;

  try {
    decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return { error: "Invalid or expired token: " + error, status: 401 };
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { type: true, id: true, email: true, name: true },
  });

  if (!user || user.type !== "ADMIN") {
    return { error: "Unauthorized - Admin access required", status: 403 };
  }

  return { user, error: null };
}
