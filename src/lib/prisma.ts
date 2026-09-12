import { PrismaClient } from '@prisma/client'

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || "postgresql://postgres.zormgmpjvfxgfftqbtlu:%23%23JACK50N8550%23%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
  // If using direct Supabase URL which lacks IPv4 support on serverless (Vercel/AWS),
  // automatically route through the IPv4-compatible pooler
  if (url.includes("db.zormgmpjvfxgfftqbtlu.supabase.co")) {
    url = "postgresql://postgres.zormgmpjvfxgfftqbtlu:%23%23JACK50N8550%23%23@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
  }
  return url
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl()
      }
    }
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

