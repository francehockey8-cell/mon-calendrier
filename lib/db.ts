import 'temporal-polyfill/global';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from '../prisma/contract.json' with { type: 'json' };

const globalForDb = globalThis as unknown as {
  db?: any;
  connectPromise?: Promise<any>;
};

export const db =
  globalForDb.db ??
  postgres({
    contractJson,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export async function connectDB() {
  if (!globalForDb.connectPromise) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL manquante dans les variables d\'environnement Vercel.'
      );
    }
    globalForDb.connectPromise = (db as any)
      .connect({ url })
      .catch((e: any) => {
        if (String(e?.message).includes('already connected')) return;
        // reset pour réessayer au prochain appel
        globalForDb.connectPromise = undefined;
        throw e;
      });
  }
  return globalForDb.connectPromise;
}