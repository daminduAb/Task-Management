import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import prisma from "./config/db";

// Run with: npm run seed
async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: { name: "Admin User", email: "admin@demo.com", password, role: "ADMIN" },
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@demo.com" },
    update: {},
    create: { name: "PM User", email: "pm@demo.com", password, role: "PM" },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: { name: "Member User", email: "member@demo.com", password, role: "MEMBER" },
  });

  const project = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Demo Project",
      description: "A sample project created by the seed script",
      ownerId: pm.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member.id } },
    update: {},
    create: { projectId: project.id, userId: member.id },
  });

  await prisma.task.create({
    data: {
      title: "Set up project repository",
      description: "Initialize the repo and push first commit",
      priority: "HIGH",
      projectId: project.id,
      assignedTo: member.id,
      createdBy: pm.id,
    },
  });

  console.log("Seed complete. Demo logins (password: password123):");
  console.log("  Admin:  admin@demo.com");
  console.log("  PM:     pm@demo.com");
  console.log("  Member: member@demo.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
