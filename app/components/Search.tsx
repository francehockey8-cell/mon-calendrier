'use client';

import { useState, useMemo } from 'react';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Props = {
  courses: any[];
  sports: any[];
  notes: any[];
  onSelectSession: (s: any, t: 'sport' | 'course') => void;
};

export default function Search({ courses, sports, notes, onSelectSession }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out: any[] = [];
    courses.forEach((c) => {
      if (c.title.toLowerCase().includes(s) || (c.location || '').toLowerCase().includes(s))
        out.push({ kind: 'course', item: c, label: c.title, sub: `${JOURS[c.dayOfWeek - 1]} · ${c.startTime}` });
    });
    sports.forEach((sp) => {
      if (sp.activity.toLowerCase().includes(s) || (sp.location || '').toLowerCase().includes(s))
        out.push({ kind: 'sport', item: sp, label: sp.activity, sub: `${JOURS[sp.dayOfWeek - 1]} · ${sp.startTime}` });
    });
    notes.forEach((n) => {
      if (n.title.toLowerCase().includes(s) || (n.content || '').toLowerCase().includes(s))
        out.push({ kind: 'note', item: n, label: n.title, sub: n.content || '' });
    });
    return out.slice(0, 20);
  }, [q, courses, sports, notes]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
      >
        🔍 <span className="hidden sm:inline">Rechercher…</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 p-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-lg">🔍</span>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cours, sport, note…"
                className="flex-1 bg-transparent outline-none text-sm dark:text-slate-100"
              />
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && q && (
                <div className="p-4 text-sm text-slate-400 text-center">Aucun résultat</div>
              )}
              {!q && (
                <div className="p-4 text-xs text-slate-400 text-center">
                  Tape pour chercher dans tes cours, sport et notes
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (r.kind === 'note') return;
                    onSelectSession(r.item, r.kind === 'sport' ? 'sport' : 'course');
                    setOpen(false);
                    setQ('');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  <div className="text-sm font-medium dark:text-slate-100">
                    {r.kind === 'sport' ? '🏒 ' : r.kind === 'course' ? '📚 ' : '📝 '}
                    {r.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}