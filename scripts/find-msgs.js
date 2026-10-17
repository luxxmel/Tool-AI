const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function find() {
  const msgs = await prisma.message.findMany();
  console.log('Total messages in DB:', msgs.length);
  for (const m of msgs) {
    console.log(m.id, m.sender, m.content.slice(0, 50));
  }
}
find().finally(() => prisma.$disconnect());
