import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Use raw MongoDB command to find and fix null updatedAt values
    const result = await prisma.$runCommandRaw({
        update: "User",
        updates: [
            {
                q: { updatedAt: null },
                u: [{ $set: { updatedAt: "$createdAt" } }],
                multi: true,
            },
        ],
    });

    console.log("Migration result:", JSON.stringify(result, null, 2));
    console.log("Done! All null updatedAt values have been set to createdAt.");
}

main()
    .catch((e) => {
        console.error("Migration failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
