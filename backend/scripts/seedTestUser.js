const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test users cannot be seeded in production')
  }

  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  if (!email || !password) {
    throw new Error('Set SEED_EMAIL and SEED_PASSWORD to create a test user')
  }

  const prisma = new PrismaClient()
  const hashed = await bcrypt.hash(password, 10)

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log('Test user already exists:', email)
      // optionally update password
      await prisma.user.update({ where: { email }, data: { password: hashed } })
      console.log('Updated password for test user')
    } else {
      const user = await prisma.user.create({ data: { email, password: hashed } })
      console.log('Created test user:', user.email)
    }
  } catch (err) {
    console.error('Error creating test user', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
