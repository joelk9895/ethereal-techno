import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Check the default user
    const user = await prisma.user.findFirst({
        where: { email: "default@example.com" },
        select: { id: true, email: true, username: true },
    });
    console.log("Default user:", JSON.stringify(user, null, 2));

    // Check if UUID exists in any User record
    try {
        const userById = await prisma.$runCommandRaw({
            find: "User",
            filter: { _id: "1ee9f7e6-7844-4027-a2cc-8a533f88b48e" },
            limit: 1,
        });
        console.log("User with UUID _id:", JSON.stringify(userById, null, 2));
    } catch (e) {
        console.log("Could not search User by UUID _id:", (e as Error).message);
    }

    // Check all users
    const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, username: true },
    });
    console.log("\nAll users:");
    allUsers.forEach(u => console.log(`  id=${u.id} email=${u.email} username=${u.username}`));
}

main()
    .catch((e) => {
        console.error("Debug failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
