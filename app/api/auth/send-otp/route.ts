import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/app/services/emailService";
import { checkAndRecordRateLimit, storeOtp, verifyOtp as verifyOtpStore } from "@/app/lib/otpStore";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name } = body;

        if (!email || !name) {
            return NextResponse.json(
                { error: "Email and name are required" },
                { status: 400 }
            );
        }

        const emailLower = email.toLowerCase().trim();

        // Rate limiting
        if (checkAndRecordRateLimit(emailLower)) {
            return NextResponse.json(
                { error: "Too many requests. Please wait before requesting another code." },
                { status: 429 }
            );
        }

        // Generate and store OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        storeOtp(emailLower, name, otp);

        // Send OTP email via Brevo
        const result = await sendOtpEmail(emailLower, name, otp);

        if (!result.success) {
            console.error("Failed to send OTP email:", result.error);
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Verification code sent to your email" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Send OTP error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
