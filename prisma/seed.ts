import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/security";

const prisma = new PrismaClient();

async function main() {
    // Creates 15 demo users:
    // user1/pass1, user2/pass2, ..., user15/pass15
    const users = Array.from({ length: 15 }).map((_, i) => ({
        username: `user${i + 1}`,
        password: `pass${i + 1}`
    }));

    for (const u of users) {
        const passwordHash = await hashPassword(u.password);
        await prisma.user.upsert({
            where: { username: u.username },
            update: {},
            create: { username: u.username, passwordHash }
        });
    }

    console.log("Seed completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });