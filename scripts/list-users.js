const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function users() {
  const list = await prisma.user.findMany();
  console.log('Users in DB:');
  for (const u of list) {
    console.log(u.id, u.email, u.name, u.role);
  }
}
users().finally(() => prisma.$disconnect());
