'use client';

import { isActiveOnDate } from '@/lib/recurrence';

export default function TodayCard({
  courses,
  sports,
  holidays,
}: {
  courses: any[];
  sports: any[];
  holidays: any[];
}) {
  const today = new Date();
  const todayCourses = courses.filter((c) => isActiveOnDate(c, today, holidays));
  const todaySports = sports.filter((s) => isActiveOnDate(s, today, holidays));

  const all = [
    ...todayCourses.map((c) => ({ ...c, _kind: 'course', _label: c.title })),
    ...todaySports.map((s) => ({ ...s, _kind: 'sport', _label: s.activity })),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const nowTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
  const nextIdx = all.findIndex((e) => e.startTime >= nowTime);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold dark:text-slate-100">📌 Aujourd'hui</h2>
        <span className="text-xs text-slate-400 capitalize">
          {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {all.length === 0 && (
        <p className="text-sm text-slate-400">Journée libre 🎉</p>
      )}

      <div className="space-y-2">
        {all.map((e, i) => {
          const isNext = i === nextIdx;
          const isNow = e.startTime <= nowTime && e.endTime >= nowTime;
          const done = e.endTime < nowTime;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded-lg transition ${
                isNow
                  ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-300'
                  : isNext
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : ''
              } ${done ? 'opacity-50' : ''}`}
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: e.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate dark:text-slate-100">
                  {e._kind === 'sport' ? '🏒 ' : '📚 '}
                  {e._label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {e.startTime} – {e.endTime}
                  {e.location && ` · ${e.location}`}
                </div>
              </div>
              {isNow && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  En cours
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}