const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const users = await prisma.user.findMany()
    console.log('users:', users)
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
})()
