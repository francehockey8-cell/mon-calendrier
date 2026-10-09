'use client';

import { useEffect, useState } from 'react';

export default function Countdown({ holidays }: { holidays: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Squelette neutre pour le serveur
  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 h-20" />
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = holidays
    .map((h) => ({ ...h, start: new Date(h.startDate) }))
    .filter((h) => h.start >= today)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const days = Math.ceil(
    (next.start.getTime() - today.getTime()) / (1000 * 3600 * 24)
  );

  const label =
    days === 0 ? "C'est aujourd'hui !" : days === 1 ? 'Demain !' : `Dans ${days} jours`;

  return (
    <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
      <div className="text-3xl">🏖️</div>
      <div>
        <div className="text-xs text-amber-700 dark:text-amber-300 uppercase font-medium">
          Prochaines vacances
        </div>
        <div className="text-base md:text-lg font-bold text-amber-900 dark:text-amber-100">
          {next.name} — {label}
        </div>
      </div>
    </div>
  );
}