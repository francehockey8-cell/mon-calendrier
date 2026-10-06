import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const SECRET = process.env.AUTH_SECRET || 'dev-secret-change-me-please';
const COOKIE = 'cal_session';

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const hmac = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  if (hmac !== expected) return null;
  return payload;
}

export async function createSession(userId: number) {
  const token = sign(String(userId));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    path: '/',
  });
}

export async function getUserIdFromSession(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  const id = parseInt(payload);
  return isNaN(id) ? null : id;
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}