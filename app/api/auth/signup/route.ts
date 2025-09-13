import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export async function POST(request: Request) {
  const { email, name, password, type } = await request.json();

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password,
      type,
    },
  });

  return NextResponse.json(user);
}
