'use client';

import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const HOUR_HEIGHT = 64;

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

  const dow = (date: Date) => {
    const d = date.getDay();
    return d === 0 ? 7 : d;
  };

  const isHoliday = (date: Date) =>
    holidays.some(
      (h) => date >= new Date(h.startDate) && date <= new Date(h.endDate)
    );

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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-slate-50">
        <div className="p-2"></div>
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-2 text-center border-l ${isHoliday(day) ? 'bg-amber-100' : ''}`}
          >
            <div className="text-xs text-slate-500 uppercase">
              {format(day, 'EEE', { locale: fr })}
            </div>
            <div className="text-lg font-semibold">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div
          className="grid grid-cols-[60px_repeat(7,1fr)] relative"
          style={{ height: HOURS.length * HOUR_HEIGHT }}
        >
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="text-xs text-slate-400 text-right pr-2 relative"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2">{h}:00</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const holiday = isHoliday(day);
            const d = dow(day);
            const dayCourses = holiday
              ? []
              : courses.filter((c) => c.dayOfWeek === d);
            const daySports = sports.filter((s) => s.dayOfWeek === d);

            return (
              <div
                key={day.toISOString()}
                className={`relative border-l border-slate-100 ${
                  holiday ? 'bg-amber-50/40' : ''
                }`}
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-t border-slate-100"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {dayCourses.map((c: any) => (
                  <button
                    key={`c-${c.id}`}
                    onClick={() => onSelectSession(c, 'course')}
                    className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-xs overflow-hidden shadow-sm text-left hover:brightness-95 hover:shadow-md transition cursor-pointer"
                    style={{
                      top: timeToPx(c.startTime),
                      height: durationToPx(c.startTime, c.endTime),
                      backgroundColor: c.color + '55',
                      borderLeft: `3px solid ${c.color}`,
                    }}
                  >
                    <div className="font-medium truncate leading-tight">{c.title}</div>
                    <div className="text-[10px] text-slate-700">
                      {c.startTime}–{c.endTime}
                    </div>
                    {c.location && (
                      <div className="text-[10px] text-slate-500 truncate">
                        {c.location}
                      </div>
                    )}
                  </button>
                ))}

                {daySports.map((s: any) => (
                  <button
                    key={`s-${s.id}`}
                    onClick={() => onSelectSession(s, 'sport')}
                    className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-xs overflow-hidden shadow-sm text-left hover:brightness-95 hover:shadow-md transition cursor-pointer"
                    style={{
                      top: timeToPx(s.startTime),
                      height: durationToPx(s.startTime, s.endTime),
                      backgroundColor: s.color + '55',
                      borderLeft: `3px solid ${s.color}`,
                    }}
                  >
                    <div className="font-medium truncate leading-tight">
                      🏒 {s.activity}
                    </div>
                    <div className="text-[10px] text-slate-700">
                      {s.startTime}–{s.endTime}
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}