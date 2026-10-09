'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSport, updateCourse, deleteSport, deleteCourse } from '../actions';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
  '#6366f1', '#eab308', '#10b981', '#64748b',
];

type Props = { session: any; type: 'sport' | 'course'; onClose: () => void };

export default function SessionModal({ session, type, onClose }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [location, setLocation] = useState(session.location || '');
  const [title, setTitle] = useState(session.title || session.activity || '');
  const [dayOfWeek, setDayOfWeek] = useState(session.dayOfWeek);
  const [color, setColor] = useState(session.color || '#3b82f6');
  const [frequency, setFrequency] = useState(session.frequency || 'weekly');
  const [startDate, setStartDate] = useState(
    session.startDate ? new Date(session.startDate).toISOString().slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    session.endDate ? new Date(session.endDate).toISOString().slice(0, 10) : ''
  );
  const [skipHolidays, setSkipHolidays] = useState(!!session.skipHolidays);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload: any = {
        dayOfWeek,
        startTime,
        endTime,
        location: location || null,
        color,
        frequency,
        startDate: startDate || null,
        endDate: endDate || null,
        skipHolidays,
      };
      if (type === 'sport') await updateSport(session.id, { ...payload, activity: title });
      else await updateCourse(session.id, { ...payload, title });
      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette séance pour TOUTES les semaines ?')) return;
    try {
      if (type === 'sport') await deleteSport(session.id);
      else await deleteCourse(session.id);
      router.refresh();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Erreur suppression');
    }
  };

  const duration = (() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    return `${Math.floor(mins / 60)}h${(mins % 60).toString().padStart(2, '0')}`;
  })();

  const freqLabel = frequency === 'biweekly' ? '1 semaine sur 2' : 'Toutes les semaines';
  const inputCls =
    'w-full min-h-[44px] border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-xl px-3 py-2 text-sm';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md max-h-[92vh] md:max-h-[90vh] overflow-y-auto animate-slide-up-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poignée mobile */}
        <div className="md:hidden w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3" />

        <div
          className="p-5 rounded-t-3xl md:rounded-t-2xl"
          style={{
            backgroundColor: color + '33',
            borderTop: `4px solid ${color}`,
          }}
        >
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <div className="text-xs text-slate-600 dark:text-slate-300 uppercase font-medium mb-1">
                {type === 'sport' ? '🏒 Sport' : '📚 Cours'}
              </div>
              <h2 className="text-xl font-bold dark:text-slate-100 truncate">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full active:bg-black/5 dark:active:bg-white/10 flex items-center justify-center text-2xl text-slate-500 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800 px-5 py-2 text-xs text-blue-800 dark:text-blue-200 flex flex-col gap-1">
          <div>
            🔁 <b>{freqLabel}</b> — le <b>{JOURS[dayOfWeek - 1]}</b>
          </div>
          {(startDate || endDate) && (
            <div className="text-[11px]">
              {startDate && <>Du {new Date(startDate).toLocaleDateString('fr-FR')}</>}
              {endDate && <> au {new Date(endDate).toLocaleDateString('fr-FR')}</>}
            </div>
          )}
          {skipHolidays && <div>🏖️ Masqué pendant les vacances</div>}
        </div>

        <div className="p-5 space-y-4 pb-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          {!editing ? (
            <>
              <div className="space-y-3">
                <Row label="📅 Jour" value={JOURS[dayOfWeek - 1]} />
                <Row label="🕐 Horaires" value={`${startTime} – ${endTime}`} />
                <Row label="⏱️ Durée" value={duration} />
                <Row label="🔁 Fréquence" value={freqLabel} />
                {location && <Row label="📍 Lieu" value={location} />}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">🎨 Couleur</span>
                  <div
                    className="w-6 h-6 rounded-full border border-slate-200"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 min-h-[44px] bg-blue-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 min-h-[44px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-xl text-sm font-medium active:scale-95 transition-transform"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-2 text-xs text-amber-800 dark:text-amber-200">
                ⚠️ Modifier affectera <b>toutes les semaines</b>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Nom</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls + ' mt-1'} />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Jour</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className={inputCls + ' mt-1'}
                >
                  {JOURS.map((j, i) => (
                    <option key={j} value={i + 1}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={inputCls + ' mt-1'}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputCls + ' mt-1'}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Lieu</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="(optionnel)"
                  className={inputCls + ' mt-1'}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Couleur</label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full border-2 transition ${
                        color === c
                          ? 'border-slate-800 dark:border-white scale-110'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Fréquence</label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setFrequency('weekly')}
                    className={`flex-1 min-h-[44px] text-sm rounded-xl border ${
                      frequency === 'weekly'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Toutes les sem.
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency('biweekly')}
                    className={`flex-1 min-h-[44px] text-sm rounded-xl border ${
                      frequency === 'biweekly'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    1 sem. sur 2
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Début (opt.)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputCls + ' mt-1'}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Fin (opt.)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={inputCls + ' mt-1'}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={skipHolidays}
                  onChange={(e) => setSkipHolidays(e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-sm dark:text-slate-200">🏖️ Pas pendant les vacances</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 min-h-[44px] bg-green-500 text-white rounded-xl text-sm font-medium active:scale-95 disabled:opacity-50"
                >
                  {saving ? '...' : '✓ Enregistrer'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up-modal {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up-modal {
          animation: slide-up-modal 0.28s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @media (min-width: 768px) {
          .animate-slide-up-modal {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-medium dark:text-slate-100">{value}</span>
    </div>
  );
}