import "dotenv/config";

import prisma from "../lib/db";
import bcrypt from "bcrypt";

const SALT = parseInt(process.env.SALT!);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

async function main() {
  // Insert roles
  const roles = ["admin", "writer"];
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });

    console.log(`Role "${role}" seeded successfully`);
  }

  const sponsorGroups = ["gigawatt", "megawatt", "kilowatt", "bme", "science"];
  for (const group of sponsorGroups) {
    const groupExist = await prisma.sponsorGroup.findUnique({ where: { name: group } });
    if (groupExist) continue;

    await prisma.sponsorGroup.upsert({
      where: { name: group },
      update: {},
      create: { name: group },
    });

    console.log(`Sponsor group "${group}" seeded successfully`);
  }

  // Fetch the ADMIN role ID
  const adminRole = await prisma.role.findUnique({ where: { name: "admin" }, select: { id: true } });

  if (!adminRole) throw new Error("'admin' role not found");

  // Check if admin user already exists
  const adminUserExists = await prisma.user.findUnique({ where: { email: "admin@test.hu" }, select: { id: true } });

  if (adminUserExists) {
    console.log("Admin user already exists. Skipping seeding.");
    return;
  }

  const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT);

  // Create admin user and assign ADMIN role
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@test.hu" },
    update: {},
    create: {
      email: "admin@test.hu",
      password: adminHashedPassword,
      firstName: "Admin",
      lastName: "User",
      UserRole: {
        create: {
          role: {
            connect: { id: adminRole.id },
          },
        },
      },
    },
  });

  console.log("\nAdmin user seeded successfully\n\nUsername: admin@test.hu\nPassword: [SEE ENV] \n");

  // create template posts
  const createPost = await prisma.post.create({
    data: {
      title: "First Post",
      slug: "first-post",
      content: "This is the first post.",
      shortDesc: "This is the first post.",
      publishedAt: new Date(),
      publishedById: adminUser.id,
    },
  });

  if (createPost) {
    console.log("\nPosts seeded successfully");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
