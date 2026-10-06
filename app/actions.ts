'use server';

import { db, connectDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function dateToTemporal(dateStr: string): any {
  const d = new Date(dateStr) as any;
  if (typeof d.toTemporalInstant === 'function') return d.toTemporalInstant();
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

export async function addCourse(data: {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  color?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  skipHolidays?: boolean;
}) {
  await connectDB();
  await db.orm.public.Course.create({
    title: data.title,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location || null,
    color: data.color || '#3b82f6',
    frequency: data.frequency || 'weekly',
    startDate: data.startDate ? dateToTemporal(data.startDate) : null,
    endDate: data.endDate ? dateToTemporal(data.endDate) : null,
    skipHolidays: data.skipHolidays || false,
  });
  revalidatePath('/', 'layout');
}

export async function addSport(data: {
  activity: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  color?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  skipHolidays?: boolean;
}) {
  await connectDB();
  await db.orm.public.SportSession.create({
    activity: data.activity,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location || null,
    color: data.color || '#ef4444',
    frequency: data.frequency || 'weekly',
    startDate: data.startDate ? dateToTemporal(data.startDate) : null,
    endDate: data.endDate ? dateToTemporal(data.endDate) : null,
    skipHolidays: data.skipHolidays || false,
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

// ===== MODIFICATION =====
async function safeUpdate(collection: any, id: number, data: any) {
  if (typeof collection.update === 'function') {
    try {
      return await collection.update({ id, ...data });
    } catch {}
  }
  if (typeof collection.update === 'function') {
    try {
      return await collection.update({ where: { id }, data });
    } catch {}
  }
  if (typeof collection.where === 'function') {
    const q = collection.where({ id });
    if (q && typeof q.update === 'function') return await q.update(data);
  }
  if (typeof collection.updateOne === 'function') {
    return await collection.updateOne({ id, ...data });
  }
  throw new Error('Aucune méthode de mise à jour disponible');
}

export async function updateSport(id: number, data: {
  activity?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  color?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  skipHolidays?: boolean;
}) {
  await connectDB();
  const payload: any = { ...data };
  if (data.startDate !== undefined) {
    payload.startDate = data.startDate ? dateToTemporal(data.startDate) : null;
  }
  if (data.endDate !== undefined) {
    payload.endDate = data.endDate ? dateToTemporal(data.endDate) : null;
  }
  await safeUpdate(db.orm.public.SportSession, id, payload);
  revalidatePath('/', 'layout');
}

export async function updateCourse(id: number, data: {
  title?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  color?: string;
  frequency?: string;
  startDate?: string | null;
  endDate?: string | null;
  skipHolidays?: boolean;
}) {
  await connectDB();
  const payload: any = { ...data };
  if (data.startDate !== undefined) {
    payload.startDate = data.startDate ? dateToTemporal(data.startDate) : null;
  }
  if (data.endDate !== undefined) {
    payload.endDate = data.endDate ? dateToTemporal(data.endDate) : null;
  }
  await safeUpdate(db.orm.public.Course, id, payload);
  revalidatePath('/', 'layout');
}