'use server';

import { db, connectDB } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createSession,
  getUserIdFromSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from '@/lib/auth';

// ===== HELPERS =====
function dateToTemporal(dateStr: string): any {
  const d = new Date(dateStr) as any;
  if (typeof d.toTemporalInstant === 'function') return d.toTemporalInstant();
  return d;
}

// ===== AUTH =====
export async function getCurrentUser() {
  await connectDB();
  const id = await getUserIdFromSession();
  if (!id) return null;
  const users = await db.orm.public.User.where({ id }).all();
  return users[0] || null;
}

export async function signupAction(formData: FormData) {
  await connectDB();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password || password.length < 6) {
    return { error: 'Email et mot de passe (min 6 caractères) requis.' };
  }

  // Vérifier si un user existe déjà → interdit
  const existing = await db.orm.public.User.all();
  if (existing.length > 0) {
    return { error: 'Un compte existe déjà. Un seul compte est autorisé.' };
  }

  const hash = await hashPassword(password);
  const created = await db.orm.public.User.create({
    email,
    passwordHash: hash,
    isOwner: true,
  });

  const id = (created as any)?.id;
  if (!id) return { error: 'Erreur lors de la création du compte.' };
  await createSession(id);
  redirect('/');
}

export async function loginAction(formData: FormData) {
  await connectDB();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email et mot de passe requis.' };

  const users = await db.orm.public.User.where({ email }).all();
  const user = users[0];
  if (!user) return { error: 'Identifiants invalides.' };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: 'Identifiants invalides.' };

  await createSession(user.id);
  redirect('/');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// ===== LECTURE (protégée) =====
async function requireOwner() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Non authentifié');
  if (!user.isOwner) throw new Error('Compte non autorisé');
  return user;
}

export async function getCourses() {
  await requireOwner();
  return db.orm.public.Course.all();
}

export async function getSports() {
  await requireOwner();
  return db.orm.public.SportSession.all();
}

export async function getHolidays() {
  await requireOwner();
  return db.orm.public.Holiday.all();
}

export async function getNotes() {
  await requireOwner();
  return db.orm.public.Note.all();
}

// ===== AJOUT =====
export async function addNote(formData: FormData) {
  await requireOwner();
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

export async function addCourse(data: any) {
  await requireOwner();
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

export async function addSport(data: any) {
  await requireOwner();
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
    completedDates: '',
  });
  revalidatePath('/', 'layout');
}

// ===== SUPPRESSION =====
export async function deleteNote(id: number) {
  await requireOwner();
  await db.orm.public.Note.delete({ id });
  revalidatePath('/', 'layout');
}

export async function deleteCourse(id: number) {
  await requireOwner();
  await db.orm.public.Course.delete({ id });
  revalidatePath('/', 'layout');
}

export async function deleteSport(id: number) {
  await requireOwner();
  await db.orm.public.SportSession.delete({ id });
  revalidatePath('/', 'layout');
}

// ===== MODIFICATION =====
async function safeUpdate(collection: any, id: number, data: any) {
  if (typeof collection.update === 'function') {
    try { return await collection.update({ id, ...data }); } catch {}
  }
  if (typeof collection.update === 'function') {
    try { return await collection.update({ where: { id }, data }); } catch {}
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

export async function updateSport(id: number, data: any) {
  await requireOwner();
  const payload: any = { ...data };
  if (data.startDate !== undefined)
    payload.startDate = data.startDate ? dateToTemporal(data.startDate) : null;
  if (data.endDate !== undefined)
    payload.endDate = data.endDate ? dateToTemporal(data.endDate) : null;
  await safeUpdate(db.orm.public.SportSession, id, payload);
  revalidatePath('/', 'layout');
}

export async function updateCourse(id: number, data: any) {
  await requireOwner();
  const payload: any = { ...data };
  if (data.startDate !== undefined)
    payload.startDate = data.startDate ? dateToTemporal(data.startDate) : null;
  if (data.endDate !== undefined)
    payload.endDate = data.endDate ? dateToTemporal(data.endDate) : null;
  await safeUpdate(db.orm.public.Course, id, payload);
  revalidatePath('/', 'layout');
}

// ===== CHECK-LIST SPORT =====
export async function toggleSportCompleted(sportId: number, dateISO: string) {
  await requireOwner();
  const rows = await db.orm.public.SportSession.where({ id: sportId }).all();
  const sport = rows[0];
  if (!sport) throw new Error('Séance introuvable');

  const dates: string[] = sport.completedDates
    ? sport.completedDates.split(',').filter(Boolean)
    : [];
  const idx = dates.indexOf(dateISO);
  if (idx >= 0) dates.splice(idx, 1);
  else dates.push(dateISO);

  await safeUpdate(db.orm.public.SportSession, sportId, {
    completedDates: dates.join(','),
  });
  revalidatePath('/', 'layout');
}