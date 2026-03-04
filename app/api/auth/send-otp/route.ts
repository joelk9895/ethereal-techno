import { NextRequest, NextResponse } from "next/server";
import { sendOtpEmail } from "@/app/services/emailService";

// ─── In-Memory OTP Store ─────────────────────────────
// Map<email, { otp, name, expiresAt, attempts }>
interface OtpEntry {
    otp: string;
    name: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
}

const otpStore = new Map<string, OtpEntry>();
const rateLimitMap = new Map<string, number[]>(); // email -> timestamps of requests

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanupExpired() {
    const now = Date.now();
    for (const [email, entry] of otpStore.entries()) {
        if (now > entry.expiresAt) {
            otpStore.delete(email);
        }
    }
}

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
        const now = Date.now();
        const timestamps = rateLimitMap.get(emailLower) || [];
        const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

        if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json(
                { error: "Too many requests. Please wait before requesting another code." },
                { status: 429 }
            );
        }

        recentRequests.push(now);
        rateLimitMap.set(emailLower, recentRequests);

        // Cleanup expired entries
        cleanupExpired();

        // Generate and store OTP
        const otp = generateOtp();
        otpStore.set(emailLower, {
            otp,
            name,
            expiresAt: now + OTP_EXPIRY_MS,
            attempts: 0,
            createdAt: now,
        });

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

// ─── Exported for use by signup route ────────────────

export function verifyOtp(email: string, otp: string): { valid: boolean; error?: string } {
    const emailLower = email.toLowerCase().trim();
    const entry = otpStore.get(emailLower);

    if (!entry) {
        return { valid: false, error: "No verification code found. Please request a new one." };
    }

    if (Date.now() > entry.expiresAt) {
        otpStore.delete(emailLower);
        return { valid: false, error: "Verification code has expired. Please request a new one." };
    }

    entry.attempts += 1;
    if (entry.attempts > 5) {
        otpStore.delete(emailLower);
        return { valid: false, error: "Too many failed attempts. Please request a new code." };
    }

    if (entry.otp !== otp) {
        return { valid: false, error: "Invalid verification code" };
    }

    // Valid — remove from store
    otpStore.delete(emailLower);
    return { valid: true };
}
