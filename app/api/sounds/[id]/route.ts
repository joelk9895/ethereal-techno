import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/database";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                contents: {
                    include: {
                        metadata: true,
                        file: true
                    }
                },
                user: {
                    select: {
                        artistName: true,
                        username: true
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product detail:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
