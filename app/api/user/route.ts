import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import * as jose from "jose";

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");

    let payload;
    try {
      const { payload: verifiedPayload } = await jose.jwtVerify(token, secret);
      payload = verifiedPayload;
    } catch (err) {
      console.error("JWT Verify Error in Delete User:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Attempt to delete the user.
    // Ensure that cascade deletes are correctly configured on your Prisma schema
    // if a user has related records (e.g. applications, orders, pack contents).
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Account successfully deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
