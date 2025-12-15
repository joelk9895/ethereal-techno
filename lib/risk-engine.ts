import { headers } from "next/headers";
import prisma from "@/app/lib/database";

interface RiskFactors {
    isNewDevice: boolean;
    isNewCountry: boolean;
    isDatacenter: boolean;
    isTokenReuse: boolean;
    isKnownDevice: boolean;
}

interface RiskResult {
    score: number;
    action: "ALLOW" | "SOFT_CHALLENGE" | "STEP_UP" | "BLOCK";
    factors: RiskFactors;
    details: string[];
}

export class RiskEngine {
    private static readonly SCORES = {
        NEW_DEVICE: 30,
        NEW_COUNTRY: 40,
        DATACENTER: 25,
        TOKEN_REUSE: 100,
        KNOWN_DEVICE: -20,
    };

    /**
     * Calculate Risk Score for a Login/Refresh attempt
     */
    static async evaluate(userId: string, currentIp: string, currentUserAgent: string, isTokenReuse: boolean = false): Promise<RiskResult> {
        let score = 0;
        const details: string[] = [];

        // --- FACTOR: TOKEN REUSE ---
        if (isTokenReuse) {
            score += this.SCORES.TOKEN_REUSE;
            details.push("TOKEN_REUSE_DETECTED");
        }

        // --- FACTOR: NEW DEVICE / KNOWN DEVICE ---
        // Typescript might complain about session if client wasn't regenerated, but we ran prisma generate.
        const previousSession = await prisma.session.findFirst({
            where: {
                userId,
                userAgent: currentUserAgent,
            }
        });

        const isKnownDevice = !!previousSession;
        if (isKnownDevice) {
            score += this.SCORES.KNOWN_DEVICE;
            details.push("KNOWN_DEVICE");
        } else {
            score += this.SCORES.NEW_DEVICE;
            details.push("NEW_DEVICE");
        }

        // --- FACTOR: NEW COUNTRY ---
        const headersList = headers();
        // In Next.js 13+ headers() is synchronous, but in latest might be async or ReadonlyHeaders requires specific handling.
        // The error said `Property 'get' does not exist on type 'Promise<ReadonlyHeaders>'`. This implies Next.js 15 or specific config where headers() returns a Promise.
        // We will await it.
        const headerStore = await headersList;
        const country = headerStore.get("x-vercel-ip-country") || "UNKNOWN";

        // --- FINAL SCORE ---
        score = Math.max(0, score);

        // --- DETERMINE ACTION ---
        let action: RiskResult["action"] = "ALLOW";

        if (score >= 90) action = "BLOCK";
        else if (score >= 60) action = "STEP_UP";
        else if (score >= 30) action = "SOFT_CHALLENGE";

        return {
            score,
            action,
            factors: {
                isNewDevice: !isKnownDevice,
                isNewCountry: country !== "UNKNOWN",
                isDatacenter: false,
                isTokenReuse,
                isKnownDevice
            },
            details
        };
    }

    /**
     * Log the risk assessment
     */
    static async log(sessionId: string, userId: string, event: string, result: RiskResult) {
        await prisma.riskLog.create({
            data: {
                sessionId,
                userId,
                event,
                score: result.score,
                details: JSON.stringify(result.details)
            }
        });
    }
}
