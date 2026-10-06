'use client';

import { useMemo } from 'react';
import { isActiveOnDate } from '@/lib/recurrence';
import { addDays } from 'date-fns';

export default function Suggestions({
  courses,
  sports,
  holidays,
}: {
  courses: any[];
  sports: any[];
  holidays: any[];
}) {
  const suggestions = useMemo(() => {
    const out: any[] = [];
    for (let i = 1; i <= 7; i++) {
      const day = addDays(new Date(), i);
      const dayCourses = courses.filter((c) => isActiveOnDate(c, day, holidays));
      const daySports = sports.filter((s) => isActiveOnDate(s, day, holidays));
      const busy = [...dayCourses, ...daySports].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );

      // Chercher un gap de 45min+ entre 15h et 21h
      const events = [
        ...busy.map((b) => ({ s: timeToMin(b.startTime), e: timeToMin(b.endTime) })),
        { s: timeToMin('22:00'), e: timeToMin('22:00') }, // borne fin
      ];
      let cursor = timeToMin('15:00');
      for (const ev of events) {
        const gap = ev.s - cursor;
        if (gap >= 45) {
          out.push({
            date: day,
            from: minToTime(cursor),
            to: minToTime(ev.s),
            minutes: gap,
          });
        }
        cursor = Math.max(cursor, ev.e);
      }
    }
    return out.slice(0, 3);
  }, [courses, sports, holidays]);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-sm p-4 border border-purple-100 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">💡</span>
        <h3 className="font-semibold text-sm dark:text-slate-100">
          Créneaux libres cette semaine
        </h3>
      </div>
      <div className="space-y-1.5">
        {suggestions.map((s, i) => (
          <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="font-medium">
              {s.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
            </span>
            <span className="text-slate-400">
              {s.from} – {s.to}
            </span>
            <span className="ml-auto text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
              {s.minutes} min
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-2">
        💡 Idée : planifie une session SuperDeker ou maniement
      </p>
    </div>
  );
}

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minToTime(m: number) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}