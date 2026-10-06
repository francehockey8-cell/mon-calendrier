import { signupAction } from '../actions';
import { db, connectDB } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  await connectDB();
  const users = await db.orm.public.User.all();
  // Si un user existe déjà → interdit de créer un nouveau compte
  if (users.length > 0) redirect('/login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <form
        action={signupAction}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center mb-2">
          <div className="text-5xl mb-2">📅</div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Première installation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ce compte sera le propriétaire du calendrier
          </p>
        </div>

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
          placeholder="Mot de passe (6 caractères min)"
          required
          minLength={6}
          className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm"
        />
        <button className="w-full bg-blue-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-600">
          Créer mon compte
        </button>
      </form>
    </div>
  );
}