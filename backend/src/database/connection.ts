import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://danny:Jjustmee12773@45.154.238.111:5432/gamecom';

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Test connection function
export async function testConnection() {
  try {
    await client`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default db; 