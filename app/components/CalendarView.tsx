'use client';

import { useState } from 'react';
import {
  format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval,
  isWithinInterval, addMonths, addWeeks, addDays, startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  addNote, deleteNote, addCourse, addSport, deleteCourse, deleteSport,
  toggleSportCompleted,
} from '../actions';
import WeekView from './WeekView';
import DayView from './DayView';
import SessionModal from './SessionModal';
import Search from './Search';
import { isActiveOnDate } from '@/lib/recurrence';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6'];

type Props = { courses: any[]; sports: any[]; holidays: any[]; notes: any[] };

export default function CalendarView({ courses, sports, holidays, notes }: Props) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSportForm, setShowSportForm] = useState(false);
  const [showFreeNotes, setShowFreeNotes] = useState(true);
  const [selectedSession, setSelectedSession] = useState<{ session: any; type: 'sport' | 'course' } | null>(null);

  const goPrev = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const goNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const goToday = () => { const t = new Date(); setCurrentDate(t); setSelectedDay(t); };

  const title = (() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: fr });
    if (view === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return `Semaine du ${format(ws, 'd MMM', { locale: fr })} au ${format(we, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  })();

  const isHolidayDay = (date: Date) =>
    holidays.some((h) => isWithinInterval(date, { start: new Date(h.startDate), end: new Date(h.endDate) }));

  const notesOfDay = (date: Date) => notes.filter((n) => n.date && isSameDay(new Date(n.date), date));
  const freeNotes = notes.filter((n) => !n.date);

  const renderMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {JOURS.map((j) => (
            <div key={j} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">{j}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: ((monthStart.getDay() === 0 ? 7 : monthStart.getDay()) + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const holiday = isHolidayDay(day);
            const dayNotes = notesOfDay(day);
            const hasCourse = courses.some((c) => isActiveOnDate(c, day, holidays));
            const hasSport = sports.some((s) => isActiveOnDate(s, day, holidays));
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => { setSelectedDay(day); setCurrentDate(day); setView('day'); }}
                className={`aspect-square rounded-xl border p-2 text-sm flex flex-col text-left transition
                  ${holiday ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
                  ${isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'}`}
              >
                <div className="font-medium dark:text-slate-100">{format(day, 'd')}</div>
                <div className="flex gap-1 mt-auto flex-wrap">
                  {hasCourse && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  {hasSport && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  {dayNotes.map((n: any) => (
                    <span key={n.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: n.color }} />
                  ))}
                </div>
                {holiday && <span className="text-[10px] text-amber-700 dark:text-amber-400">Vac.</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSidePanel = () => {
    const dayCourses = selectedDay ? courses.filter((c) => isActiveOnDate(c, selectedDay, holidays)) : [];
    const daySports = selectedDay ? sports.filter((s) => isActiveOnDate(s, selectedDay, holidays)) : [];
    const dayNotes = selectedDay ? notesOfDay(selectedDay) : [];

    const isSportDone = (sport: any) => {
      if (!selectedDay) return false;
      const iso = selectedDay.toISOString().slice(0, 10);
      return (sport.completedDates || '').split(',').includes(iso);
    };

    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 flex gap-2">
          <button onClick={() => { setShowCourseForm(!showCourseForm); setShowSportForm(false); setShowNoteForm(false); }} className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600">+ Cours</button>
          <button onClick={() => { setShowSportForm(!showSportForm); setShowCourseForm(false); setShowNoteForm(false); }} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600">+ Sport</button>
          <button onClick={() => { setShowNoteForm(!showNoteForm); setShowCourseForm(false); setShowSportForm(false); }} className="flex-1 bg-purple-500 text-white rounded-lg py-2 text-sm hover:bg-purple-600">+ Note</button>
        </div>

        {showCourseForm && <AddCourseForm onClose={() => setShowCourseForm(false)} />}
        {showSportForm && <AddSportForm onClose={() => setShowSportForm(false)} />}

        {showNoteForm && (
          <form action={addNote} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
            <input name="title" placeholder="Titre" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
            <input name="date" type="date" className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
            <div className="text-xs text-slate-400 -mt-1">Laisse vide pour une note libre 📌</div>
            <textarea name="content" placeholder="Contenu" className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
            <select name="type" className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm">
              <option value="note">Note</option>
              <option value="event">Événement</option>
            </select>
            <button className="w-full bg-purple-500 text-white rounded-lg py-2 text-sm">Enregistrer</button>
          </form>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          <button onClick={() => setShowFreeNotes(!showFreeNotes)} className="w-full flex justify-between items-center font-semibold mb-2 dark:text-slate-100">
            <span>📌 Notes libres ({freeNotes.length})</span>
            <span className="text-slate-400 text-sm">{showFreeNotes ? '−' : '+'}</span>
          </button>
          {showFreeNotes && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {freeNotes.length === 0 && <p className="text-xs text-slate-400">Aucune note libre</p>}
              {freeNotes.map((n: any) => (
                <div key={n.id} className="border-l-4 pl-3 py-1 flex justify-between items-start" style={{ borderColor: n.color }}>
                  <div>
                    <div className="text-sm font-medium dark:text-slate-100">{n.title}</div>
                    {n.content && <div className="text-xs text-slate-600 dark:text-slate-400">{n.content}</div>}
                  </div>
                  <button onClick={() => deleteNote(n.id)} className="text-xs text-slate-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {view === 'month' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold capitalize text-sm dark:text-slate-100">
                {selectedDay ? format(selectedDay, 'EEEE d MMMM', { locale: fr }) : ''}
              </h3>
              {selectedDay && (
                <button onClick={() => { setCurrentDate(selectedDay); setView('day'); }} className="text-xs text-blue-500 hover:underline">Vue jour →</button>
              )}
            </div>
            {selectedDay && isHolidayDay(selectedDay) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-2 text-xs text-amber-800 dark:text-amber-200">🏖️ Vacances</div>
            )}
            {dayCourses.length === 0 && daySports.length === 0 && dayNotes.length === 0 && (
              <p className="text-xs text-slate-400">Rien de prévu</p>
            )}
            {dayCourses.map((c: any) => (
              <button key={c.id} onClick={() => setSelectedSession({ session: c, type: 'course' })} className="w-full text-left border-l-4 pl-2 py-1 mb-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded dark:text-slate-100" style={{ borderColor: c.color }}>
                <b>{c.title}</b> · {c.startTime}
              </button>
            ))}
            {daySports.map((s: any) => (
              <div key={s.id} className="flex items-center gap-1 mb-1">
                <button
                  onClick={() => selectedDay && toggleSportCompleted(s.id, selectedDay.toISOString().slice(0, 10))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${isSportDone(s) ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}
                  title="Marquer comme faite"
                >
                  {isSportDone(s) && '✓'}
                </button>
                <button onClick={() => setSelectedSession({ session: s, type: 'sport' })} className="flex-1 text-left border-l-4 pl-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 rounded dark:text-slate-100" style={{ borderColor: s.color }}>
                  🏒 <b>{s.activity}</b> · {s.startTime}
                </button>
              </div>
            ))}
            {dayNotes.map((n: any) => (
              <div key={n.id} className="border-l-4 pl-2 py-1 mb-1 flex justify-between text-xs dark:text-slate-100" style={{ borderColor: n.color }}>
                <span>📝 <b>{n.title}</b></span>
                <button onClick={() => deleteNote(n.id)} className="text-slate-400 hover:text-red-500">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-md transition ${view === v ? 'bg-white dark:bg-slate-800 shadow-sm font-medium dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800'}`}
            >
              {v === 'month' ? '📅 Mois' : v === 'week' ? '📆 Sem.' : '📋 Jour'}
            </button>
          ))}
        </div>

        <Search courses={courses} sports={sports} notes={notes} onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })} />

        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-100">←</button>
          <h2 className="text-base md:text-lg font-semibold capitalize min-w-[150px] text-center dark:text-slate-100">{title}</h2>
          <button onClick={goNext} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-100">→</button>
          <button onClick={goToday} className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 ml-1">Auj.</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          {view === 'month' && renderMonth()}
          {view === 'week' && <WeekView currentDate={currentDate} courses={courses} sports={sports} holidays={holidays} onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })} />}
          {view === 'day' && <DayView currentDate={currentDate} courses={courses} sports={sports} holidays={holidays} notes={notes} onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })} />}
        </div>
        {renderSidePanel()}
      </div>

      {selectedSession && (
        <SessionModal session={selectedSession.session} type={selectedSession.type} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

function AddCourseForm({ onClose }: { onClose: () => void }) {
  const [color, setColor] = useState('#3b82f6');
  const [frequency, setFrequency] = useState('weekly');
  const [skipHolidays, setSkipHolidays] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addCourse({
        title: fd.get('title') as string,
        dayOfWeek: parseInt(fd.get('dayOfWeek') as string),
        startTime: fd.get('startTime') as string,
        endTime: fd.get('endTime') as string,
        location: (fd.get('location') as string) || null,
        color, frequency,
        startDate: (fd.get('startDate') as string) || null,
        endDate: (fd.get('endDate') as string) || null,
        skipHolidays,
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
      <input name="title" placeholder="Matière" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      <select name="dayOfWeek" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm">
        {JOURS.map((j, i) => <option key={j} value={i + 1}>{j}</option>)}
      </select>
      <div className="flex gap-2">
        <input name="startTime" type="time" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
        <input name="endTime" type="time" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      </div>
      <input name="location" placeholder="Salle" className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400">Couleur</label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setFrequency('weekly')} className={`flex-1 py-1.5 text-xs rounded-lg border ${frequency === 'weekly' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'}`}>Toutes les sem.</button>
        <button type="button" onClick={() => setFrequency('biweekly')} className={`flex-1 py-1.5 text-xs rounded-lg border ${frequency === 'biweekly' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'}`}>1 sem. sur 2</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" type="date" className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
        <input name="endDate" type="date" className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-xs dark:text-slate-200">
        <input type="checkbox" checked={skipHolidays} onChange={(e) => setSkipHolidays(e.target.checked)} className="w-4 h-4" />
        🏖️ Pas pendant les vacances
      </label>
      <button disabled={saving} className="w-full bg-blue-500 text-white rounded-lg py-2 text-sm disabled:opacity-50">{saving ? '...' : 'Enregistrer'}</button>
    </form>
  );
}

function AddSportForm({ onClose }: { onClose: () => void }) {
  const [color, setColor] = useState('#ef4444');
  const [frequency, setFrequency] = useState('weekly');
  const [skipHolidays, setSkipHolidays] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await addSport({
        activity: fd.get('activity') as string,
        dayOfWeek: parseInt(fd.get('dayOfWeek') as string),
        startTime: fd.get('startTime') as string,
        endTime: fd.get('endTime') as string,
        location: (fd.get('location') as string) || null,
        color, frequency,
        startDate: (fd.get('startDate') as string) || null,
        endDate: (fd.get('endDate') as string) || null,
        skipHolidays,
      });
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
      <input name="activity" placeholder="Activité" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      <select name="dayOfWeek" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm">
        {JOURS.map((j, i) => <option key={j} value={i + 1}>{j}</option>)}
      </select>
      <div className="flex gap-2">
        <input name="startTime" type="time" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
        <input name="endTime" type="time" required className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      </div>
      <input name="location" placeholder="Lieu" className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400">Couleur</label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setFrequency('weekly')} className={`flex-1 py-1.5 text-xs rounded-lg border ${frequency === 'weekly' ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'}`}>Toutes les sem.</button>
        <button type="button" onClick={() => setFrequency('biweekly')} className={`flex-1 py-1.5 text-xs rounded-lg border ${frequency === 'biweekly' ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'}`}>1 sem. sur 2</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" type="date" className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
        <input name="endDate" type="date" className="border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-xs dark:text-slate-200">
        <input type="checkbox" checked={skipHolidays} onChange={(e) => setSkipHolidays(e.target.checked)} className="w-4 h-4" />
        🏖️ Pas pendant les vacances
      </label>
      <button disabled={saving} className="w-full bg-red-500 text-white rounded-lg py-2 text-sm disabled:opacity-50">{saving ? '...' : 'Enregistrer'}</button>
    </form>
  );
}