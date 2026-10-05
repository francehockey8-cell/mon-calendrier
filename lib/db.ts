import 'temporal-polyfill/global';
import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from '../prisma/contract.json' with { type: 'json' };

// ... le reste ne change pas

// Singleton pour éviter plusieurs connexions en dev
const globalForDb = globalThis as unknown as {
  db?: any;
  connectPromise?: Promise<void>;
};

export const db = globalForDb.db ?? postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// ✅ Promesse partagée : tous les appels attendent la MÊME connexion
export async function connectDB() {
  if (!globalForDb.connectPromise) {
    globalForDb.connectPromise = (async () => {
      try {
        await (db as any).connect();
      } catch (e: any) {
        // Si déjà connecté, on ignore l'erreur
        if (!String(e?.message).includes('already connected')) {
          globalForDb.connectPromise = undefined;
          throw e;
        }
      }
    })();
  }
  return globalForDb.connectPromise;
}