import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Drop existing indexes (both sparse and non-sparse)
    const indexNames = [
        "User_telegramChatId_key",
        "User_telegramConnectionToken_key",
    ];

    for (const name of indexNames) {
        try {
            await prisma.$runCommandRaw({ dropIndexes: "User", index: name });
            console.log(`Dropped index: ${name}`);
        } catch (e) {
            console.log(`Index ${name} not found, skipping.`);
        }
    }

    // Recreate with partial filter expressions — only index non-null values
    await prisma.$runCommandRaw({
        createIndexes: "User",
        indexes: [
            {
                key: { telegramChatId: 1 },
                name: "User_telegramChatId_key",
                unique: true,
                partialFilterExpression: {
                    telegramChatId: { $type: "string" },
                },
            },
            {
                key: { telegramConnectionToken: 1 },
                name: "User_telegramConnectionToken_key",
                unique: true,
                partialFilterExpression: {
                    telegramConnectionToken: { $type: "string" },
                },
            },
        ],
    });

    console.log("Created partial unique indexes (null values are now ignored). Done!");
}

main()
    .catch((e) => {
        console.error("Fix failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
