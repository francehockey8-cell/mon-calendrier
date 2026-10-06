'use server';

import { db, connectDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Helper pour convertir une string de date en Temporal.Instant
// sans que TypeScript râle (le polyfill est chargé via layout.tsx)
function dateToTemporal(dateStr: string): any {
  const d = new Date(dateStr) as any;
  if (typeof d.toTemporalInstant === 'function') {
    return d.toTemporalInstant();
  }
  // Fallback : objet avec toString ISO
  return d;
}

// ===== LECTURE =====
export async function getCourses() {
  await connectDB();
  return db.orm.public.Course.all();
}

export async function getSports() {
  await connectDB();
  return db.orm.public.SportSession.all();
}

export async function getHolidays() {
  await connectDB();
  return db.orm.public.Holiday.all();
}

export async function getNotes() {
  await connectDB();
  return db.orm.public.Note.all();
}

// ===== AJOUT =====
export async function addNote(formData: FormData) {
  await connectDB();
  const dateStr = formData.get('date') as string;
  const date = dateStr ? dateToTemporal(dateStr) : null;
  await db.orm.public.Note.create({
    date,
    title: formData.get('title') as string,
    content: (formData.get('content') as string) || null,
    type: (formData.get('type') as string) || 'note',
    color: (formData.get('color') as string) || '#8b5cf6',
  });
  revalidatePath('/', 'layout');
}

export async function addCourse(formData: FormData) {
  await connectDB();
  await db.orm.public.Course.create({
    title: formData.get('title') as string,
    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    location: (formData.get('location') as string) || null,
    color: (formData.get('color') as string) || '#3b82f6',
  });
  revalidatePath('/', 'layout');
}

export async function addSport(formData: FormData) {
  await connectDB();
  await db.orm.public.SportSession.create({
    activity: formData.get('activity') as string,
    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    location: (formData.get('location') as string) || null,
    color: (formData.get('color') as string) || '#ef4444',
  });
  revalidatePath('/', 'layout');
}

// ===== SUPPRESSION =====
export async function deleteNote(id: number) {
  await connectDB();
  await db.orm.public.Note.delete({ id });
  revalidatePath('/', 'layout');
}

export async function deleteCourse(id: number) {
  await connectDB();
  await db.orm.public.Course.delete({ id });
  revalidatePath('/', 'layout');
}

export async function deleteSport(id: number) {
  await connectDB();
  await db.orm.public.SportSession.delete({ id });
  revalidatePath('/', 'layout');
}

// ===== MODIFICATION (robuste, essaie plusieurs syntaxes Prisma 8) =====
async function safeUpdate(collection: any, id: number, data: any) {
  if (typeof collection.update === 'function') {
    try {
      return await collection.update({ id, ...data });
    } catch {
      /* try next */
    }
  }

  if (typeof collection.update === 'function') {
    try {
      return await collection.update({ where: { id }, data });
    } catch {
      /* try next */
    }
  }

  if (typeof collection.where === 'function') {
    const q = collection.where({ id });
    if (q && typeof q.update === 'function') {
      return await q.update(data);
    }
  }

  if (typeof collection.updateOne === 'function') {
    return await collection.updateOne({ id, ...data });
  }

  throw new Error('Aucune méthode de mise à jour disponible sur ce modèle');
}

export async function updateSport(id: number, data: {
  activity?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
}) {
  await connectDB();
  await safeUpdate(db.orm.public.SportSession, id, data);
  revalidatePath('/', 'layout');
}

export async function updateCourse(id: number, data: {
  title?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
}) {
  await connectDB();
  await safeUpdate(db.orm.public.Course, id, data);
  revalidatePath('/', 'layout');
}