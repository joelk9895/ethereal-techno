import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { verifyOtp } from "@/app/lib/otpStore";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, otp, newPassword } = body;

        if (!email || !otp || !newPassword) {
            return NextResponse.json(
                { error: "Email, verification code, and new password are required" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
             return NextResponse.json(
                { error: "New password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        const emailLower = email.toLowerCase().trim();

        // 1. Verify OTP
        const otpVerification = verifyOtp(`forgot-${emailLower}`, otp);
        if (!otpVerification.valid) {
            return NextResponse.json(
                { error: otpVerification.error || "Invalid verification code" },
                { status: 400 }
            );
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update user in database
        try {
             await prisma.user.update({
                where: { email: emailLower },
                data: { password: hashedPassword },
            });
        } catch {
             // In case the user doesn't exist (should be rare if they got the OTP, but possible if deleted in between)
             return NextResponse.json(
                { error: "Failed to reset password. User not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
    } catch (error) {
        console.error("Forgot password reset error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
