import bcrypt from "bcrypt";

import prisma from "../config/database.js";

type UserSeed = {
  id?: string;
  email: string;
  name: string;
  password: string;
  role?: string;
};

const userSeeds: UserSeed[] = [
  {
    email: "admin@price.local",
    name: "Admin User",
    password: "Admin@12345",
    role:"admin"
  },
  {
    email: "ade@example.com",
    name: "Ade",
    password: "Password@123",
  },
  {
    email: "chi@example.com",
    name: "Chi",
    password: "Password@123",
  },
  {
    email: "emma@example.com",
    name: "Emma",
    password: "Password@123",
  },
  {
    id: "test-user",
    email: "femi@example.com",
    name: "Femi",
    password: "Password@123",
  },
];

export async function seedUsers() {
  const createdUsers = [];

  for (const user of userSeeds) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.upsert({
      where: { id: user.email },
      update: {
        email: user.email,
        name: user.name,
        password: passwordHash,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: passwordHash,
      },
    });

    createdUsers.push(result);
  }

  return createdUsers;
}

async function main() {
  try {
    const users = await seedUsers();
    console.log(`Seeded ${users.length} users successfully.`);
  } catch (error) {
    console.error("Failed to seed users:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

export async function runUserSeed() {
  return main();
}
