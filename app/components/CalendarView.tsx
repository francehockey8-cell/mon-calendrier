'use client';

import { useState } from 'react';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  addMonths,
  addWeeks,
  addDays,
  startOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  addNote,
  deleteNote,
  addCourse,
  addSport,
  deleteCourse,
  deleteSport,
  toggleSportCompleted,
} from '../actions';
import WeekView from './WeekView';
import DayView from './DayView';
import SessionModal from './SessionModal';
import Search from './Search';
import { isActiveOnDate } from '@/lib/recurrence';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_COURT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
];

type Props = { courses: any[]; sports: any[]; holidays: any[]; notes: any[] };

export default function CalendarView({ courses, sports, holidays, notes }: Props) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSportForm, setShowSportForm] = useState(false);
  const [showFreeNotes, setShowFreeNotes] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<{
    session: any;
    type: 'sport' | 'course';
  } | null>(null);

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
  const goToday = () => {
    const t = new Date();
    setCurrentDate(t);
    setSelectedDay(t);
  };

  const title = (() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: fr });
    if (view === 'week') {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = addDays(ws, 6);
      return `${format(ws, 'd MMM', { locale: fr })} → ${format(we, 'd MMM yyyy', { locale: fr })}`;
    }
    return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  })();

  const isHolidayDay = (date: Date) =>
    holidays.some((h) =>
      isWithinInterval(date, {
        start: new Date(h.startDate),
        end: new Date(h.endDate),
      })
    );

  const notesOfDay = (date: Date) =>
    notes.filter((n) => n.date && isSameDay(new Date(n.date), date));
  const freeNotes = notes.filter((n) => !n.date);

  // ============ VUE MOIS (responsive) ============
  const renderMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-2 md:p-4">
        {/* En-tête jours */}
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
          {JOURS.map((j, i) => (
            <div
              key={j}
              className="text-center text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              <span className="hidden md:inline">{j}</span>
              <span className="md:hidden">{JOURS_COURT[i]}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {Array.from({
            length: ((monthStart.getDay() === 0 ? 7 : monthStart.getDay()) + 6) % 7,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const holiday = isHolidayDay(day);
            const dayNotes = notesOfDay(day);
            const hasCourse = courses.some((c) => isActiveOnDate(c, day, holidays));
            const hasSport = sports.some((s) => isActiveOnDate(s, day, holidays));
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => {
                  setSelectedDay(day);
                  setCurrentDate(day);
                  setView('day');
                }}
                className={`aspect-square rounded-lg md:rounded-xl border p-1 md:p-2 text-sm flex flex-col text-left transition active:scale-95
                  ${
                    holiday
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isToday && !isSelected ? 'border-blue-400 dark:border-blue-600' : ''}
                `}
              >
                <div
                  className={`text-xs md:text-sm font-medium dark:text-slate-100 ${
                    isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="flex gap-0.5 md:gap-1 mt-auto flex-wrap">
                  {hasCourse && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500" />}
                  {hasSport && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500" />}
                  {dayNotes.slice(0, 2).map((n: any) => (
                    <span
                      key={n.id}
                      className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                      style={{ backgroundColor: n.color }}
                    />
                  ))}
                </div>
                {holiday && (
                  <span className="text-[8px] md:text-[10px] text-amber-700 dark:text-amber-400 leading-none">
                    Vac.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ============ PANNEAU LATÉRAL (contenu partagé) ============
  const renderPanelContent = () => {
    const dayCourses = selectedDay
      ? courses.filter((c) => isActiveOnDate(c, selectedDay, holidays))
      : [];
    const daySports = selectedDay
      ? sports.filter((s) => isActiveOnDate(s, selectedDay, holidays))
      : [];
    const dayNotes = selectedDay ? notesOfDay(selectedDay) : [];

    const isSportDone = (sport: any) => {
      if (!selectedDay) return false;
      const iso = selectedDay.toISOString().slice(0, 10);
      return (sport.completedDates || '').split(',').includes(iso);
    };

    return (
      <div className="space-y-4">
        {/* Boutons d'ajout */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 flex gap-2">
          <button
            onClick={() => {
              setShowCourseForm(!showCourseForm);
              setShowSportForm(false);
              setShowNoteForm(false);
            }}
            className="flex-1 min-h-[44px] bg-blue-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            + Cours
          </button>
          <button
            onClick={() => {
              setShowSportForm(!showSportForm);
              setShowCourseForm(false);
              setShowNoteForm(false);
            }}
            className="flex-1 min-h-[44px] bg-red-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            + Sport
          </button>
          <button
            onClick={() => {
              setShowNoteForm(!showNoteForm);
              setShowCourseForm(false);
              setShowSportForm(false);
            }}
            className="flex-1 min-h-[44px] bg-purple-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            + Note
          </button>
        </div>

        {showCourseForm && <AddCourseForm onClose={() => setShowCourseForm(false)} />}
        {showSportForm && <AddSportForm onClose={() => setShowSportForm(false)} />}

        {showNoteForm && (
          <form action={addNote} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
            <input
              name="title"
              placeholder="Titre"
              required
              className="w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
            <input
              name="date"
              type="date"
              className="w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
            <div className="text-xs text-slate-400 -mt-1">
              Laisse vide pour une note libre 📌
            </div>
            <textarea
              name="content"
              placeholder="Contenu"
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm"
            />
            <select
              name="type"
              className="w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm"
            >
              <option value="note">Note</option>
              <option value="event">Événement</option>
            </select>
            <button className="w-full min-h-[44px] bg-purple-500 text-white rounded-xl text-sm font-medium active:scale-95">
              Enregistrer
            </button>
          </form>
        )}

        {/* Notes libres */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          <button
            onClick={() => setShowFreeNotes(!showFreeNotes)}
            className="w-full flex justify-between items-center font-semibold mb-2 dark:text-slate-100"
          >
            <span>📌 Notes libres ({freeNotes.length})</span>
            <span className="text-slate-400 text-sm">{showFreeNotes ? '−' : '+'}</span>
          </button>
          {showFreeNotes && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {freeNotes.length === 0 && <p className="text-xs text-slate-400">Aucune note libre</p>}
              {freeNotes.map((n: any) => (
                <div
                  key={n.id}
                  className="border-l-4 pl-3 py-1 flex justify-between items-start"
                  style={{ borderColor: n.color }}
                >
                  <div>
                    <div className="text-sm font-medium dark:text-slate-100">{n.title}</div>
                    {n.content && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">{n.content}</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="text-xs text-slate-400 active:text-red-500 min-w-[28px]"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail jour (vue Mois uniquement) */}
        {view === 'month' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold capitalize text-sm dark:text-slate-100">
                {selectedDay ? format(selectedDay, 'EEEE d MMMM', { locale: fr }) : ''}
              </h3>
              {selectedDay && (
                <button
                  onClick={() => {
                    setCurrentDate(selectedDay);
                    setView('day');
                    setMobilePanelOpen(false);
                  }}
                  className="text-xs text-blue-500 min-h-[32px] px-2"
                >
                  Vue jour →
                </button>
              )}
            </div>
            {selectedDay && isHolidayDay(selectedDay) && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 mb-2 text-xs text-amber-800 dark:text-amber-200">
                🏖️ Vacances
              </div>
            )}
            {dayCourses.length === 0 && daySports.length === 0 && dayNotes.length === 0 && (
              <p className="text-xs text-slate-400">Rien de prévu</p>
            )}
            {dayCourses.map((c: any) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedSession({ session: c, type: 'course' });
                  setMobilePanelOpen(false);
                }}
                className="w-full text-left border-l-4 pl-2 py-2 mb-1 text-xs active:bg-slate-50 dark:active:bg-slate-700 rounded dark:text-slate-100 min-h-[44px]"
                style={{ borderColor: c.color }}
              >
                📚 <b>{c.title}</b> · {c.startTime}
              </button>
            ))}
            {daySports.map((s: any) => (
              <div key={s.id} className="flex items-center gap-1 mb-1">
                <button
                  onClick={() =>
                    selectedDay && toggleSportCompleted(s.id, selectedDay.toISOString().slice(0, 10))
                  }
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs active:scale-90 ${
                    isSportDone(s)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSportDone(s) && '✓'}
                </button>
                <button
                  onClick={() => {
                    setSelectedSession({ session: s, type: 'sport' });
                    setMobilePanelOpen(false);
                  }}
                  className="flex-1 text-left border-l-4 pl-2 py-2 text-xs active:bg-slate-50 dark:active:bg-slate-700 rounded dark:text-slate-100 min-h-[44px]"
                  style={{ borderColor: s.color }}
                >
                  🏒 <b>{s.activity}</b> · {s.startTime}
                </button>
              </div>
            ))}
            {dayNotes.map((n: any) => (
              <div
                key={n.id}
                className="border-l-4 pl-2 py-1 mb-1 flex justify-between text-xs dark:text-slate-100"
                style={{ borderColor: n.color }}
              >
                <span>📝 <b>{n.title}</b></span>
                <button onClick={() => deleteNote(n.id)} className="text-slate-400 active:text-red-500 min-w-[28px]">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Barre d'outils */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-2 md:p-3 space-y-2 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3">
        {/* Ligne 1 : vues + nav */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`min-h-[40px] px-3 md:px-4 text-sm rounded-lg transition ${
                  view === v
                    ? 'bg-white dark:bg-slate-800 shadow-sm font-medium dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {v === 'month' ? '📅' : v === 'week' ? '📆' : '📋'}
                <span className="hidden sm:inline ml-1">
                  {v === 'month' ? 'Mois' : v === 'week' ? 'Sem.' : 'Jour'}
                </span>
              </button>
            ))}
          </div>

          <div className="md:hidden">
            <Search
              courses={courses}
              sports={sports}
              notes={notes}
              onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })}
            />
          </div>
        </div>

        {/* Ligne 2 : navigation dates */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={goPrev}
            className="min-w-[44px] min-h-[44px] rounded-xl active:bg-slate-100 dark:active:bg-slate-700 dark:text-slate-100 text-lg"
          >
            ←
          </button>
          <h2 className="text-sm md:text-lg font-semibold capitalize text-center flex-1 truncate dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={goNext}
            className="min-w-[44px] min-h-[44px] rounded-xl active:bg-slate-100 dark:active:bg-slate-700 dark:text-slate-100 text-lg"
          >
            →
          </button>
          <button
            onClick={goToday}
            className="min-h-[44px] px-3 text-sm rounded-xl bg-blue-500 text-white font-medium active:scale-95 transition-transform"
          >
            Auj.
          </button>

          <div className="hidden md:block ml-2">
            <Search
              courses={courses}
              sports={sports}
              notes={notes}
              onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })}
            />
          </div>
        </div>
      </div>

      {/* Contenu principal : calendrier + panneau */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4 md:gap-6">
        <div>
          {view === 'month' && renderMonth()}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              courses={courses}
              sports={sports}
              holidays={holidays}
              onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              courses={courses}
              sports={sports}
              holidays={holidays}
              notes={notes}
              onSelectSession={(s, t) => setSelectedSession({ session: s, type: t })}
            />
          )}
        </div>

        {/* Panneau latéral : caché sur mobile */}
        <div className="hidden lg:block">{renderPanelContent()}</div>
      </div>

      {/* BOUTON FLOTTANT mobile pour ouvrir le panneau */}
      <button
        onClick={() => setMobilePanelOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center text-2xl active:scale-90 transition-transform"
        title="Ajouter / voir le jour"
      >
        +
      </button>

      {/* DRAWER mobile (bas de l'écran) */}
      {mobilePanelOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
          onClick={() => setMobilePanelOpen(false)}
        >
          <div
            className="bg-slate-50 dark:bg-slate-900 w-full max-h-[88vh] rounded-t-3xl overflow-y-auto p-4 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg dark:text-slate-100">Ajouter / Voir</h3>
              <button
                onClick={() => setMobilePanelOpen(false)}
                className="w-10 h-10 rounded-full active:bg-slate-200 dark:active:bg-slate-700 flex items-center justify-center text-2xl text-slate-500 dark:text-slate-400"
              >
                ×
              </button>
            </div>
            {renderPanelContent()}
          </div>
        </div>
      )}

      {/* Modal de séance */}
      {selectedSession && (
        <SessionModal
          session={selectedSession.session}
          type={selectedSession.type}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* Animation du drawer */}
      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

// ===== FORMULAIRES =====

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
        color,
        frequency,
        startDate: (fd.get('startDate') as string) || null,
        endDate: (fd.get('endDate') as string) || null,
        skipHolidays,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
      <input name="title" placeholder="Matière" required className={inputCls} />
      <select name="dayOfWeek" required className={inputCls}>
        {JOURS.map((j, i) => (
          <option key={j} value={i + 1}>
            {j}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input name="startTime" type="time" required className={inputCls} />
        <input name="endTime" type="time" required className={inputCls} />
      </div>
      <input name="location" placeholder="Salle" className={inputCls} />
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400">Couleur</label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 ${
                color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFrequency('weekly')}
          className={`flex-1 min-h-[44px] text-xs rounded-xl border ${
            frequency === 'weekly'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'
          }`}
        >
          Toutes les sem.
        </button>
        <button
          type="button"
          onClick={() => setFrequency('biweekly')}
          className={`flex-1 min-h-[44px] text-xs rounded-xl border ${
            frequency === 'biweekly'
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'
          }`}
        >
          1 sem. sur 2
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" type="date" className={inputCls} />
        <input name="endDate" type="date" className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-xs dark:text-slate-200 min-h-[44px]">
        <input
          type="checkbox"
          checked={skipHolidays}
          onChange={(e) => setSkipHolidays(e.target.checked)}
          className="w-5 h-5"
        />
        🏖️ Pas pendant les vacances
      </label>
      <button
        disabled={saving}
        className="w-full min-h-[44px] bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95"
      >
        {saving ? '...' : 'Enregistrer'}
      </button>
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
        color,
        frequency,
        startDate: (fd.get('startDate') as string) || null,
        endDate: (fd.get('endDate') as string) || null,
        skipHolidays,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-2">
      <input name="activity" placeholder="Activité" required className={inputCls} />
      <select name="dayOfWeek" required className={inputCls}>
        {JOURS.map((j, i) => (
          <option key={j} value={i + 1}>
            {j}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input name="startTime" type="time" required className={inputCls} />
        <input name="endTime" type="time" required className={inputCls} />
      </div>
      <input name="location" placeholder="Lieu" className={inputCls} />
      <div>
        <label className="text-xs text-slate-500 dark:text-slate-400">Couleur</label>
        <div className="flex gap-1 mt-1 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 ${
                color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFrequency('weekly')}
          className={`flex-1 min-h-[44px] text-xs rounded-xl border ${
            frequency === 'weekly'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'
          }`}
        >
          Toutes les sem.
        </button>
        <button
          type="button"
          onClick={() => setFrequency('biweekly')}
          className={`flex-1 min-h-[44px] text-xs rounded-xl border ${
            frequency === 'biweekly'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 dark:text-slate-200'
          }`}
        >
          1 sem. sur 2
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input name="startDate" type="date" className={inputCls} />
        <input name="endDate" type="date" className={inputCls} />
      </div>
      <label className="flex items-center gap-2 text-xs dark:text-slate-200 min-h-[44px]">
        <input
          type="checkbox"
          checked={skipHolidays}
          onChange={(e) => setSkipHolidays(e.target.checked)}
          className="w-5 h-5"
        />
        🏖️ Pas pendant les vacances
      </label>
      <button
        disabled={saving}
        className="w-full min-h-[44px] bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95"
      >
        {saving ? '...' : 'Enregistrer'}
      </button>
    </form>
  );
}