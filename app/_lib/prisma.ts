import { PrismaClient } from '../../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// 1. Properly declare the global type
const prismaClientSingleton = () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// 2. Use globalThis for better environment compatibility
const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma