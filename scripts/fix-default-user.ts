import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Delete the old default user with malformed UUID _id
    try {
        await prisma.$runCommandRaw({
            delete: "User",
            deletes: [
                {
                    q: { _id: "1ee9f7e6-7844-4027-a2cc-8a533f88b48e" },
                    limit: 1,
                },
            ],
        });
        console.log("Deleted old default user with UUID _id");
    } catch (e) {
        console.log("Could not delete via raw command, trying Prisma:", (e as Error).message);
    }

    // Recreate the default user — Prisma will auto-generate a valid ObjectID
    const newUser = await prisma.user.create({
        data: {
            email: "default@example.com",
            name: "Default User",
            username: "defaultuser",
            password: "defaultpassword",
        },
    });

    console.log("Created new default user with valid ObjectID:", newUser.id);
}

main()
    .catch((e) => {
        console.error("Fix failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
