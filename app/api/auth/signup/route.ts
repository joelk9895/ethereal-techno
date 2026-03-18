import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/app/lib/otpStore";
import { sendWelcomeEmail } from "@/app/services/emailService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, surname, country, email, password, otp } = body;

    if (!name || !surname || !country || !email || !password || !otp) {
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

    // Verify OTP before creating the user
    const otpResult = verifyOtp(`signup-${email}`, otp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { error: otpResult.error || "Invalid verification code" },
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
        surname,
        country,
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

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't want to fail the signup if the email fails, just log it.
    }

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
  }
}
