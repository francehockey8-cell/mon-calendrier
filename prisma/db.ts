import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from './contract.json' with { type: 'json' };

// On crée le client
export const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});

// On expose une fonction qui connecte le driver
export async function connectDB() {
  // On appelle connect() sur le client lui-même
  await db.connect();
}