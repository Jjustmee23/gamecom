import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://danny:Jjustmee12773@45.154.238.111:5432/gamecom',
  },
  verbose: true,
  strict: true,
} satisfies Config; 