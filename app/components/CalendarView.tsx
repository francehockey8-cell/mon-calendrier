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
} from '../actions';
import WeekView from './WeekView';
import DayView from './DayView';
import SessionModal from './SessionModal';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Props = {
  courses: any[];
  sports: any[];
  holidays: any[];
  notes: any[];
};

export default function CalendarView({ courses, sports, holidays, notes }: Props) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showSportForm, setShowSportForm] = useState(false);
  const [showFreeNotes, setShowFreeNotes] = useState(true);
  const [selectedSession, setSelectedSession] = useState<{
    session: any;
    type: 'sport' | 'course';
  } | null>(null);

  // --- Navigation ---
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
      return `Semaine du ${format(ws, 'd MMM', { locale: fr })} au ${format(
        we,
        'd MMM yyyy',
        { locale: fr }
      )}`;
    }
    return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
  })();

  // --- Helpers ---
  const isHoliday = (date: Date) =>
    holidays.some((h) =>
      isWithinInterval(date, {
        start: new Date(h.startDate),
        end: new Date(h.endDate),
      })
    );
  const dow = (date: Date) => {
    const d = date.getDay();
    return d === 0 ? 7 : d;
  };
  const notesOfDay = (date: Date) =>
    notes.filter((n) => n.date && isSameDay(new Date(n.date), date));

  const freeNotes = notes.filter((n) => !n.date);

  // --- Vue Mois ---
  const renderMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {JOURS.map((j) => (
            <div
              key={j}
              className="text-center text-sm font-medium text-slate-500"
            >
              {j}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: (dow(monthStart) + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {daysInMonth.map((day) => {
            const holiday = isHoliday(day);
            const dayNotes = notesOfDay(day);
            const hasCourse =
              !holiday && courses.some((c) => c.dayOfWeek === dow(day));
            const hasSport = sports.some((s) => s.dayOfWeek === dow(day));
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => {
                  setSelectedDay(day);
                  setCurrentDate(day);
                  setView('day');
                }}
                className={`aspect-square rounded-xl border p-2 text-sm flex flex-col text-left transition
                  ${holiday ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}
                  ${isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-300'}`}
              >
                <div className="font-medium text-slate-700">{format(day, 'd')}</div>
                <div className="flex gap-1 mt-auto flex-wrap">
                  {hasCourse && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                  {hasSport && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {dayNotes.map((n: any) => (
                    <span
                      key={n.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: n.color }}
                    />
                  ))}
                </div>
                {holiday && (
                  <span className="text-[10px] text-amber-700">Vacances</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Panneau latéral ---
  const renderSidePanel = () => {
    const dayCourses =
      selectedDay && !isHoliday(selectedDay)
        ? courses.filter((c) => c.dayOfWeek === dow(selectedDay))
        : [];
    const daySports = selectedDay
      ? sports.filter((s) => s.dayOfWeek === dow(selectedDay))
      : [];
    const dayNotes = selectedDay ? notesOfDay(selectedDay) : [];

    return (
      <div className="space-y-4">
        {/* Boutons d'ajout */}
        <div className="bg-white rounded-2xl shadow-sm p-3 flex gap-2">
          <button
            onClick={() => {
              setShowCourseForm(!showCourseForm);
              setShowSportForm(false);
              setShowNoteForm(false);
            }}
            className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600"
          >
            + Cours
          </button>
          <button
            onClick={() => {
              setShowSportForm(!showSportForm);
              setShowCourseForm(false);
              setShowNoteForm(false);
            }}
            className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm hover:bg-red-600"
          >
            + Sport
          </button>
          <button
            onClick={() => {
              setShowNoteForm(!showNoteForm);
              setShowCourseForm(false);
              setShowSportForm(false);
            }}
            className="flex-1 bg-purple-500 text-white rounded-lg py-2 text-sm hover:bg-purple-600"
          >
            + Note
          </button>
        </div>

        {/* Formulaire Cours */}
        {showCourseForm && (
          <form
            action={addCourse}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-2"
          >
            <input
              name="title"
              placeholder="Matière"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <select
              name="dayOfWeek"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {JOURS.map((j, i) => (
                <option key={j} value={i + 1}>
                  {j}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                name="startTime"
                type="time"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="endTime"
                type="time"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <input
              name="location"
              placeholder="Salle"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button className="w-full bg-blue-500 text-white rounded-lg py-2 text-sm">
              Enregistrer
            </button>
          </form>
        )}

        {/* Formulaire Sport */}
        {showSportForm && (
          <form
            action={addSport}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-2"
          >
            <input
              name="activity"
              placeholder="Activité"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <select
              name="dayOfWeek"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {JOURS.map((j, i) => (
                <option key={j} value={i + 1}>
                  {j}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                name="startTime"
                type="time"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <input
                name="endTime"
                type="time"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <input
              name="location"
              placeholder="Lieu"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button className="w-full bg-red-500 text-white rounded-lg py-2 text-sm">
              Enregistrer
            </button>
          </form>
        )}

        {/* Formulaire Note */}
        {showNoteForm && (
          <form
            action={addNote}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-2"
          >
            <input
              name="title"
              placeholder="Titre"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              name="date"
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="text-xs text-slate-400 -mt-1">
              Laisse vide pour une note libre 📌
            </div>
            <textarea
              name="content"
              placeholder="Contenu"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <select
              name="type"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="note">Note</option>
              <option value="event">Événement</option>
            </select>
            <button className="w-full bg-purple-500 text-white rounded-lg py-2 text-sm">
              Enregistrer
            </button>
          </form>
        )}

        {/* Notes libres */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <button
            onClick={() => setShowFreeNotes(!showFreeNotes)}
            className="w-full flex justify-between items-center font-semibold mb-2"
          >
            <span>📌 Notes libres ({freeNotes.length})</span>
            <span className="text-slate-400 text-sm">
              {showFreeNotes ? '−' : '+'}
            </span>
          </button>
          {showFreeNotes && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {freeNotes.length === 0 && (
                <p className="text-xs text-slate-400">Aucune note libre</p>
              )}
              {freeNotes.map((n: any) => (
                <div
                  key={n.id}
                  className="border-l-4 pl-3 py-1 flex justify-between items-start"
                  style={{ borderColor: n.color }}
                >
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.content && (
                      <div className="text-xs text-slate-600">{n.content}</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="text-xs text-slate-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail du jour sélectionné (vue Mois) */}
        {view === 'month' && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold capitalize text-sm">
                {selectedDay
                  ? format(selectedDay, 'EEEE d MMMM', { locale: fr })
                  : ''}
              </h3>
              {selectedDay && (
                <button
                  onClick={() => {
                    setCurrentDate(selectedDay);
                    setView('day');
                  }}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Vue jour →
                </button>
              )}
            </div>
            {selectedDay && isHoliday(selectedDay) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2 text-xs text-amber-800">
                🏖️ Vacances
              </div>
            )}
            {dayCourses.length === 0 &&
              daySports.length === 0 &&
              dayNotes.length === 0 && (
                <p className="text-xs text-slate-400">Rien de prévu</p>
              )}
            {dayCourses.map((c: any) => (
              <button
                key={c.id}
                onClick={() =>
                  setSelectedSession({ session: c, type: 'course' })
                }
                className="w-full text-left border-l-4 pl-2 py-1 mb-1 text-xs hover:bg-slate-50 rounded"
                style={{ borderColor: c.color }}
              >
                <b>{c.title}</b> · {c.startTime}
              </button>
            ))}
            {daySports.map((s: any) => (
              <button
                key={s.id}
                onClick={() =>
                  setSelectedSession({ session: s, type: 'sport' })
                }
                className="w-full text-left border-l-4 pl-2 py-1 mb-1 text-xs hover:bg-slate-50 rounded"
                style={{ borderColor: s.color }}
              >
                🏒 <b>{s.activity}</b> · {s.startTime}
              </button>
            ))}
            {dayNotes.map((n: any) => (
              <div
                key={n.id}
                className="border-l-4 pl-2 py-1 mb-1 flex justify-between text-xs"
                style={{ borderColor: n.color }}
              >
                <span>
                  📝 <b>{n.title}</b>
                </span>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-slate-400 hover:text-red-500"
                >
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
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm rounded-md transition ${
                view === v
                  ? 'bg-white shadow-sm font-medium'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {v === 'month' ? '📅 Mois' : v === 'week' ? '📆 Semaine' : '📋 Jour'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold capitalize min-w-[200px] text-center">
            {title}
          </h2>
          <button
            onClick={goNext}
            className="px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            →
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 ml-2"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div>
          {view === 'month' && renderMonth()}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              courses={courses}
              sports={sports}
              holidays={holidays}
              onSelectSession={(session, type) =>
                setSelectedSession({ session, type })
              }
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              courses={courses}
              sports={sports}
              holidays={holidays}
              notes={notes}
              onSelectSession={(session, type) =>
                setSelectedSession({ session, type })
              }
            />
          )}
        </div>
        {renderSidePanel()}
      </div>

      {/* Modal de détail / édition */}
      {selectedSession && (
        <SessionModal
          session={selectedSession.session}
          type={selectedSession.type}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}