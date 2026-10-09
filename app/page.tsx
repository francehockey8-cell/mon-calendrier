import { connection } from 'next/server';
import {
  getCourses,
  getSports,
  getHolidays,
  getNotes,
  getCurrentUser,
  logoutAction,
} from './actions';
import CalendarView from './components/CalendarView';
import TodayCard from './components/TodayCard';
import Countdown from './components/Countdown';
import Weather from './components/Weather';
import ThemeToggle from './components/ThemeToggle';
import Suggestions from './components/Suggestions';

export default async function Home() {
  await connection();

  const user = await getCurrentUser();
  if (!user) return null;
  if (!user.isOwner) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-sm text-center space-y-3">
          <div className="text-5xl">🔒</div>
          <h1 className="text-xl font-bold dark:text-slate-100">Accès non autorisé</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ce calendrier appartient au compte propriétaire.
          </p>
          <form action={logoutAction}>
            <button className="w-full bg-slate-500 text-white rounded-lg py-2 text-sm">
              Se déconnecter
            </button>
          </form>
        </div>
      </main>
    );
  }

  const [courses, sports, holidays, notes] = await Promise.all([
    getCourses(),
    getSports(),
    getHolidays(),
    getNotes(),
  ]);

  const serialize = (obj: any) => {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === null || val === undefined) {
        result[key] = null;
        continue;
      }
      if (typeof val === 'object' && typeof val.toString === 'function') {
        const str = val.toString();
        if (str.match(/^\d{4}-\d{2}-\d{2}T/)) {
          result[key] = str;
          continue;
        }
      }
      result[key] = val;
    }
    return result;
  };

  const sCourses = courses.map(serialize);
  const sSports = sports.map(serialize);
  const sHolidays = holidays.map(serialize);
  const sNotes = notes.map(serialize);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-3 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header responsive */}
        <header className="mb-4 md:mb-6 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold dark:text-slate-100 truncate">
              📅 Mon Calendrier
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:block">
              <Weather />
            </div>
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                className="h-11 px-3 text-sm rounded-xl bg-slate-200 dark:bg-slate-700 dark:text-slate-200 active:scale-95 transition-transform"
                title="Déconnexion"
              >
                🚪
              </button>
            </form>
          </div>
        </header>

        {/* Météo mobile (sous le header) */}
        <div className="sm:hidden mb-4">
          <Weather />
        </div>

        <div className="mb-4">
          <Countdown holidays={sHolidays} />
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4 md:gap-6 mb-4 md:mb-6">
          <TodayCard courses={sCourses} sports={sSports} holidays={sHolidays} />
          <Suggestions courses={sCourses} sports={sSports} holidays={sHolidays} />
        </div>

        <CalendarView
          courses={sCourses}
          sports={sSports}
          holidays={sHolidays}
          notes={sNotes}
        />
      </div>
    </main>
  );
}