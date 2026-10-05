'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSport, updateCourse, deleteSport, deleteCourse } from '../actions';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Props = {
  session: any;
  type: 'sport' | 'course';
  onClose: () => void;
};

export default function SessionModal({ session, type, onClose }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [location, setLocation] = useState(session.location || '');
  const [title, setTitle] = useState(session.title || session.activity || '');
  const [dayOfWeek, setDayOfWeek] = useState(session.dayOfWeek);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (type === 'sport') {
        await updateSport(session.id, {
          activity: title,
          dayOfWeek,
          startTime,
          endTime,
          location: location || null,
        });
      } else {
        await updateCourse(session.id, {
          title,
          dayOfWeek,
          startTime,
          endTime,
          location: location || null,
        });
      }
      // Force le rafraîchissement des données serveur
      router.refresh();
      onClose();
    } catch (e: any) {
      console.error('Erreur update:', e);
      setError(e?.message || 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Supprimer cette séance pour TOUTES les semaines ? Cette action est définitive.'
      )
    )
      return;
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
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`;
  })();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div
          className="p-5 rounded-t-2xl"
          style={{
            backgroundColor: (session.color || '#3b82f6') + '33',
            borderTop: `4px solid ${session.color}`,
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-600 uppercase font-medium mb-1">
                {type === 'sport' ? '🏒 Sport' : '📚 Cours'}
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {session.title || session.activity}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 text-2xl leading-none -mt-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Bandeau récurrence */}
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-2 text-xs text-blue-800 flex items-center gap-2">
          🔁 Séance récurrente — toutes les semaines le{' '}
          <b>{JOURS[dayOfWeek - 1]}</b>
        </div>

        {/* Contenu */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
              ❌ {error}
            </div>
          )}

          {!editing ? (
            <>
              <div className="space-y-3">
                <Row label="📅 Jour" value={JOURS[dayOfWeek - 1]} />
                <Row label="🕐 Horaires" value={`${startTime} – ${endTime}`} />
                <Row label="⏱️ Durée" value={duration} />
                {location && <Row label="📍 Lieu" value={location} />}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-blue-500 text-white rounded-lg py-2 text-sm hover:bg-blue-600"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-100 text-red-600 rounded-lg py-2 text-sm hover:bg-red-200"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
                ⚠️ Modifier affectera <b>toutes les semaines</b>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Nom</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Jour</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
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
                  <label className="text-xs font-medium text-slate-600">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Lieu</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="(optionnel)"
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-500 text-white rounded-lg py-2 text-sm hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-slate-100 text-slate-600 rounded-lg py-2 text-sm hover:bg-slate-200"
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}