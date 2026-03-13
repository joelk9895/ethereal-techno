import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { generateOtp, storeOtp, checkAndRecordRateLimit } from "@/app/lib/otpStore";
import { sendResetPasswordEmail } from "@/app/services/emailService";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const emailLower = email.toLowerCase().trim();
        const otpKey = `forgot-${emailLower}`;

        // 1. Check Rate Limit
        const isRateLimited = checkAndRecordRateLimit(otpKey);
        if (isRateLimited) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                { status: 429 }
            );
        }

        // 2. Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: emailLower },
        });

        if (!user) {
            // Return success even if user doesn't exist to prevent email enumeration
            return NextResponse.json({ message: "If an account exists, a reset code was sent." }, { status: 200 });
        }

        // 3. Generate OTP
        const otp = generateOtp();

        // 4. Store OTP
        storeOtp(otpKey, user.name || "Producer", otp);

        // 5. Send Email
        const result = await sendResetPasswordEmail(user.email, user.name || "Producer", otp);

        if (!result.success) {
            console.error("Failed to send forgot password email:", result.error);
            return NextResponse.json(
                { error: "Failed to send reset email. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Verification code sent successfully" }, { status: 200 });

    } catch (error) {
        console.error("Forgot password send OTP error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
