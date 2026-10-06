// Vérifie si une séance (cours ou sport) est active à une date donnée
// en tenant compte de : jour de la semaine, fréquence, dates, vacances

export type RecurrenceFields = {
  dayOfWeek: number;
  frequency?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  skipHolidays?: boolean | null;
};

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isActiveOnDate(
  item: RecurrenceFields,
  date: Date,
  holidays: any[]
): boolean {
  // 1. Jour de la semaine
  const d = date.getDay();
  const dow = d === 0 ? 7 : d;
  if (item.dayOfWeek !== dow) return false;

  const dDate = new Date(date);
  dDate.setHours(0, 0, 0, 0);

  // 2. Date de début
  if (item.startDate) {
    const start = new Date(item.startDate);
    start.setHours(0, 0, 0, 0);
    if (dDate < start) return false;
  }

  // 3. Date de fin
  if (item.endDate) {
    const end = new Date(item.endDate);
    end.setHours(23, 59, 59, 999);
    if (dDate > end) return false;
  }

  // 4. Bi-hebdomadaire (1 semaine sur 2)
  if ((item.frequency || 'weekly') === 'biweekly') {
    const refDate = item.startDate
      ? new Date(item.startDate)
      : new Date(2026, 8, 1); // 1er sept 2026 par défaut
    const mondayRef = getMonday(refDate);
    const mondayDate = getMonday(dDate);
    const weeksDiff = Math.round(
      (mondayDate.getTime() - mondayRef.getTime()) / (7 * 24 * 3600 * 1000)
    );
    if (Math.abs(weeksDiff) % 2 !== 0) return false;
  }

  // 5. Skip pendant les vacances
  if (item.skipHolidays) {
    const inHoliday = holidays.some((h) => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate);
      return dDate >= start && dDate <= end;
    });
    if (inHoliday) return false;
  }

  return true;
}