'use client';

import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isActiveOnDate } from '@/lib/recurrence';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const HOUR_HEIGHT = 60;

type Props = {
  currentDate: Date;
  courses: any[];
  sports: any[];
  holidays: any[];
  onSelectSession: (session: any, type: 'sport' | 'course') => void;
};

export default function WeekView({
  currentDate,
  courses,
  sports,
  holidays,
  onSelectSession,
}: Props) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isHolidayDay = (date: Date) =>
    holidays.some((h) => date >= new Date(h.startDate) && date <= new Date(h.endDate));

  const timeToPx = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 7) * 60 + m) * (HOUR_HEIGHT / 60);
  };
  const durationToPx = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) * (HOUR_HEIGHT / 60);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Scroll horizontal sur mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* En-tête jours */}
          <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
            <div className="p-2"></div>
            {days.map((day) => {
              const holiday = isHolidayDay(day);
              const isToday = new Date().toDateString() === day.toDateString();
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center border-l border-slate-200 dark:border-slate-700 ${
                    holiday ? 'bg-amber-100 dark:bg-amber-900/40' : ''
                  }`}
                >
                  <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div
                    className={`text-sm md:text-lg font-semibold dark:text-slate-100 ${
                      isToday ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grille horaire */}
          <div className="overflow-y-auto" style={{ maxHeight: '65vh' }}>
            <div
              className="grid grid-cols-[50px_repeat(7,1fr)] relative"
              style={{ height: HOURS.length * HOUR_HEIGHT }}
            >
              <div className="relative">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="text-[10px] md:text-xs text-slate-400 text-right pr-1 md:pr-2 relative"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="absolute -top-2 right-1 md:right-2">{h}h</span>
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const holiday = isHolidayDay(day);
                const dayCourses = courses.filter((c) => isActiveOnDate(c, day, holidays));
                const daySports = sports.filter((s) => isActiveOnDate(s, day, holidays));

                return (
                  <div
                    key={day.toISOString()}
                    className={`relative border-l border-slate-100 dark:border-slate-700 ${
                      holiday ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''
                    }`}
                  >
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="border-t border-slate-100 dark:border-slate-700"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {dayCourses.map((c: any) => (
                      <button
                        key={`c-${c.id}`}
                        onClick={() => onSelectSession(c, 'course')}
                        className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-[10px] overflow-hidden shadow-sm text-left active:scale-95 transition-transform"
                        style={{
                          top: timeToPx(c.startTime),
                          height: durationToPx(c.startTime, c.endTime),
                          backgroundColor: c.color + '55',
                          borderLeft: `3px solid ${c.color}`,
                        }}
                      >
                        <div className="font-medium truncate leading-tight dark:text-slate-100">
                          {c.title}
                        </div>
                        <div className="text-[9px] text-slate-700 dark:text-slate-300">
                          {c.startTime}
                        </div>
                      </button>
                    ))}

                    {daySports.map((s: any) => (
                      <button
                        key={`s-${s.id}`}
                        onClick={() => onSelectSession(s, 'sport')}
                        className="absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 text-[10px] overflow-hidden shadow-sm text-left active:scale-95 transition-transform"
                        style={{
                          top: timeToPx(s.startTime),
                          height: durationToPx(s.startTime, s.endTime),
                          backgroundColor: s.color + '55',
                          borderLeft: `3px solid ${s.color}`,
                        }}
                      >
                        <div className="font-medium truncate leading-tight dark:text-slate-100">
                          🏒 {s.activity}
                        </div>
                        <div className="text-[9px] text-slate-700 dark:text-slate-300">
                          {s.startTime}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}