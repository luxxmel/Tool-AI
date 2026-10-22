import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany();
  console.log("=== USERS ===");
  console.log(users.map(u => ({ id: u.id, email: u.email, name: u.name, credits: u.credits })));

  const convs = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
  console.log("=== CONVERSATIONS (" + convs.length + ") ===");
  for (const c of convs) {
    console.log(`[CONV ${c.id}] bot: ${c.botId}, user: ${c.userId}, title: ${c.title}, msgs: ${c.messages.length}`);
    for (const m of c.messages) {
      console.log(`   - [${m.sender}]: ${m.content.slice(0, 80).replace(/\n/g, " ")}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
