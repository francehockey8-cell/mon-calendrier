'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isActiveOnDate } from '@/lib/recurrence';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const HOUR_HEIGHT = 70;

type Props = {
  currentDate: Date;
  courses: any[];
  sports: any[];
  holidays: any[];
  notes: any[];
  onSelectSession: (session: any, type: 'sport' | 'course') => void;
};

export default function DayView({
  currentDate,
  courses,
  sports,
  holidays,
  notes,
  onSelectSession,
}: Props) {
  const holiday = holidays.some(
    (h) => currentDate >= new Date(h.startDate) && currentDate <= new Date(h.endDate)
  );

  const dayCourses = courses.filter((c) => isActiveOnDate(c, currentDate, holidays));
  const daySports = sports.filter((s) => isActiveOnDate(s, currentDate, holidays));
  const dayNotes = notes.filter(
    (n) => n.date && new Date(n.date).toDateString() === currentDate.toDateString()
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
      <div className={`p-4 border-b ${holiday ? 'bg-amber-50' : 'bg-slate-50'}`}>
        <h2 className="text-xl font-semibold capitalize">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
        {holiday && (
          <span className="text-sm text-amber-700">🏖️ Vacances scolaires</span>
        )}
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div
          className="grid grid-cols-[60px_1fr] relative"
          style={{ height: HOURS.length * HOUR_HEIGHT }}
        >
          <div className="relative">
            {HOURS.map((h) => (
              <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-xs text-slate-400">
                  {h}:00
                </span>
              </div>
            ))}
          </div>

          <div className="relative border-l border-slate-100">
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
                className="absolute left-2 right-2 rounded-lg px-3 py-2 text-sm overflow-hidden shadow-sm text-left hover:brightness-95 hover:shadow-md transition cursor-pointer"
                style={{
                  top: timeToPx(c.startTime),
                  height: durationToPx(c.startTime, c.endTime),
                  backgroundColor: c.color + '55',
                  borderLeft: `4px solid ${c.color}`,
                }}
              >
                <div className="font-semibold truncate">{c.title}</div>
                <div className="text-xs text-slate-700">
                  {c.startTime} – {c.endTime}
                </div>
                {c.location && (
                  <div className="text-xs text-slate-500">{c.location}</div>
                )}
              </button>
            ))}

            {daySports.map((s: any) => (
              <button
                key={`s-${s.id}`}
                onClick={() => onSelectSession(s, 'sport')}
                className="absolute left-2 right-2 rounded-lg px-3 py-2 text-sm overflow-hidden shadow-sm text-left hover:brightness-95 hover:shadow-md transition cursor-pointer"
                style={{
                  top: timeToPx(s.startTime),
                  height: durationToPx(s.startTime, s.endTime),
                  backgroundColor: s.color + '55',
                  borderLeft: `4px solid ${s.color}`,
                }}
              >
                <div className="font-semibold truncate">🏒 {s.activity}</div>
                <div className="text-xs text-slate-700">
                  {s.startTime} – {s.endTime}
                </div>
                {s.location && (
                  <div className="text-xs text-slate-500">{s.location}</div>
                )}
              </button>
            ))}

            {dayNotes.map((n: any) => (
              <div
                key={`n-${n.id}`}
                className="absolute left-2 right-2 rounded-lg px-3 py-2 text-sm overflow-hidden"
                style={{
                  top: 7 * HOUR_HEIGHT + 10,
                  backgroundColor: n.color + '33',
                  borderLeft: `4px solid ${n.color}`,
                }}
              >
                <div className="font-medium">📝 {n.title}</div>
                {n.content && (
                  <div className="text-xs text-slate-600">{n.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}