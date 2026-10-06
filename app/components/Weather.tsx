'use client';

import { useEffect, useState } from 'react';

// Nantes
const LAT = 47.2184;
const LON = -1.5536;

export default function Weather() {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=Europe/Paris`
    )
      .then((r) => r.json())
      .then((d) => {
        setData({
          temp: Math.round(d.current.temperature_2m),
          code: d.current.weather_code,
        });
      })
      .catch(() => {});
  }, []);

  const icon = (code: number) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 86) return '🌨️';
    return '⛈️';
  };

  if (!data) return <div className="text-sm text-slate-400">—</div>;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
      <span className="text-lg">{icon(data.code)}</span>
      <span className="text-sm font-medium">{data.temp}°C</span>
      <span className="text-xs text-slate-400">Nantes</span>
    </div>
  );
}