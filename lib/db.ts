import 'temporal-polyfill/global';
import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from '../prisma/contract.json' with { type: 'json' };

const globalForDb = globalThis as unknown as {
  db?: any;
  connectPromise?: Promise<any>;
};

// Create the client with the URL included
export const db = globalForDb.db ?? postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export async function connectDB() {
  if (!globalForDb.connectPromise) {
    globalForDb.connectPromise = (db as any).connect().catch((e: any) => {
      if (String(e?.message).includes('already connected')) return;
      globalForDb.connectPromise = undefined;
      throw e;
    });
  }
  return globalForDb.connectPromise;
}