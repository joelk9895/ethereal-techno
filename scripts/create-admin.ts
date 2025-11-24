import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@etherealtechno.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Admin123!", 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@etherealtechno.com",
        password: hashedPassword,
        name: "Admin",
        surname: "User",
        type: "ADMIN",
      },
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@etherealtechno.com");
    console.log("Password: Admin123!");
    console.log("User ID:", admin.id);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();