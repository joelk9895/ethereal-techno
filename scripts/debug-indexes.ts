import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // List all indexes on User collection
    const indexes = await prisma.$runCommandRaw({
        listIndexes: "User",
    });
    console.log("Current indexes on User collection:");
    console.log(JSON.stringify(indexes, null, 2));
}

main()
    .catch((e) => {
        console.error("Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
