import { getCourses, getSports, getHolidays, getNotes } from './actions';
import CalendarView from './components/CalendarView';

export default async function Home() {
  const [courses, sports, holidays, notes] = await Promise.all([
    getCourses(),
    getSports(),
    getHolidays(),
    getNotes(),
  ]);

  // Prisma 8 retourne des Temporal.Instant → on les convertit en string ISO
  const serialize = (obj: any) => {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      // Si c'est un Temporal.Instant (qui a une méthode toString ISO)
      if (val && typeof val === 'object' && typeof val.toString === 'function') {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">📅 Mon Calendrier</h1>
          <p className="text-slate-500 mt-1">Cours, sport, notes et événements</p>
        </header>
        <CalendarView
          courses={courses.map(serialize)}
          sports={sports.map(serialize)}
          holidays={holidays.map(serialize)}
          notes={notes.map(serialize)}
        />
      </div>
    </main>
  );
}