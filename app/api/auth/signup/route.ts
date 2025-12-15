import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import bcrypt from "bcryptjs";



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const username = email.split("@")[0].toLowerCase();

    let finalUsername = username;
    let usernameExists = await prisma.user.findUnique({
      where: { username: finalUsername },
    });

    while (usernameExists) {
      const randomNum = Math.floor(Math.random() * 1000);
      finalUsername = `${username}${randomNum}`;
      usernameExists = await prisma.user.findUnique({
        where: { username: finalUsername },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: finalUsername,
        password: hashedPassword,
        type: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        type: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  } finally {

  }
}
