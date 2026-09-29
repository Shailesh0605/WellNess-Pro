const { PrismaClient } = require('@prisma/client')
;(async () => {
  const prisma = new PrismaClient()
  try {
    const sessions = await prisma.session.findMany({ include: { user: true } })
    console.log('sessions:', JSON.stringify(sessions, null, 2))
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
})()
