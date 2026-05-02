import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export async function GET() {
    try {
        // Fetch all approved Products that are NOT essential elements
        const products = await prisma.product.findMany({
            where: {
                status: "APPROVED",
                isEssential: false
            },
            include: {
                contents: {
                    include: {
                        metadata: true,
                        file: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Fetch essential elements (products marked as essential)
        const essentials = await prisma.product.findMany({
            where: {
                status: "APPROVED",
                isEssential: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({ products, essentials });
    } catch (error) {
        console.error("Error fetching sounds:", error);
        return NextResponse.json({ error: "Failed to fetch sounds" }, { status: 500 });
    }
}
