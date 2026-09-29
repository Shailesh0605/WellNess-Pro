const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const workouts = await prisma.workout.findMany();
  console.log('--- Users ---');
  console.dir(users, { depth: null });
  console.log('\n--- Workouts ---');
  console.dir(workouts, { depth: null });
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
