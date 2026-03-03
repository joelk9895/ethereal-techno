/**
 * Migration script: Copy `quote` from approved ArtistApplications to User records
 * where the user's quote is currently null or empty.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Find all approved artist applications that have a quote
    const approvedApps = await prisma.artistApplication.findMany({
        where: {
            status: "APPROVED",
            quote: { not: "" },
        },
        select: {
            userId: true,
            quote: true,
        },
    });

    console.log(`Found ${approvedApps.length} approved applications with quotes.`);

    let updated = 0;
    for (const app of approvedApps) {
        // Only update if the user's quote is currently null or empty
        const user = await prisma.user.findUnique({
            where: { id: app.userId },
            select: { id: true, quote: true, artistName: true },
        });

        if (user && (!user.quote || user.quote.trim() === "")) {
            await prisma.user.update({
                where: { id: app.userId },
                data: { quote: app.quote },
            });
            console.log(`  ✓ Updated quote for ${user.artistName || user.id}: "${app.quote.substring(0, 60)}..."`);
            updated++;
        } else if (user) {
            console.log(`  - Skipped ${user.artistName || user.id} (already has quote: "${user.quote?.substring(0, 40)}...")`);
        }
    }

    console.log(`\nDone. Updated ${updated} user(s).`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
