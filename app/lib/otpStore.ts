// ─── In-Memory OTP Store ─────────────────────────────
// Shared across the application for signup, signin, and forgot-password verification
// Uses globalThis to persist across Next.js hot reloads in development

interface OtpEntry {
    otp: string;
    name: string;
    expiresAt: number;
    attempts: number;
    createdAt: number;
}

// Persist the Maps on globalThis so they survive Next.js hot reloads
const globalForOtp = globalThis as unknown as {
    __otpStore?: Map<string, OtpEntry>;
    __rateLimitMap?: Map<string, number[]>;
};

if (!globalForOtp.__otpStore) {
    globalForOtp.__otpStore = new Map<string, OtpEntry>();
}
if (!globalForOtp.__rateLimitMap) {
    globalForOtp.__rateLimitMap = new Map<string, number[]>();
}

const otpStore = globalForOtp.__otpStore;
const rateLimitMap = globalForOtp.__rateLimitMap; // email -> timestamps of requests

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_REQUESTS_PER_WINDOW = 3;

export function generateOtp(): string {
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

/**
 * Checks if an email has exceeded the OTP request rate limit.
 * If not, it records the new request.
 * @returns true if rate limit exceeded, false otherwise.
 */
export function checkAndRecordRateLimit(email: string): boolean {
    const emailLower = email.toLowerCase().trim();
    const now = Date.now();
    const timestamps = rateLimitMap.get(emailLower) || [];
    const recentRequests = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return true; // Rate limit exceeded
    }

    recentRequests.push(now);
    rateLimitMap.set(emailLower, recentRequests);
    return false;
}

/**
 * Stores a new OTP for a given email. Automatically cleans up expired entries first.
 */
export function storeOtp(email: string, name: string, otp: string) {
    cleanupExpired();
    const now = Date.now();
    otpStore.set(email.toLowerCase().trim(), {
        otp,
        name,
        expiresAt: now + OTP_EXPIRY_MS,
        attempts: 0,
        createdAt: now,
    });
}

/**
 * Verifies an OTP for a given email. Handles expiration, attempt limits, and value checking.
 * Removes the OTP from the store on success or if it expires/exceeds attempts.
 */
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
