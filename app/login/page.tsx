import { connection } from 'next/server';
import { loginAction } from '../actions';
import { redirect } from 'next/navigation';
import { db, connectDB } from '@/lib/db';

const ERRORS: Record<string, string> = {
  missing: 'Email et mot de passe requis.',
  invalid: 'Identifiants invalides.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  await connectDB();
  const users = await db.orm.public.User.all();
  if (users.length === 0) redirect('/signup');

  const { error } = await searchParams;
  const errorMsg = error ? ERRORS[error] || 'Erreur inconnue.' : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <form
        action={loginAction}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <div className="text-5xl mb-2">📅</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Connexion
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ton calendrier perso</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
        />
        <button className="w-full bg-blue-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-600">
          Se connecter
        </button>
      </form>
    </div>
  );
}