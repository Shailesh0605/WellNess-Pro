const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const workouts = await prisma.workout.findMany({ include: { user: true } })
    console.log('workouts:', JSON.stringify(workouts, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
})()
