import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const MANILA_TZ = 'Asia/Manila';

/**
 * Returns the current date in Asia/Manila timezone as YYYY-MM-DD
 */
export function getCurrentManilaDateString(): string {
  return formatInTimeZone(new Date(), MANILA_TZ, 'yyyy-MM-dd');
}

/**
 * Returns formatted Manila date for formal documents: "November 16, 2026"
 */
export function formatManilaDateFormal(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return formatInTimeZone(d, MANILA_TZ, 'MMMM d, yyyy');
  } catch {
    return String(dateInput);
  }
}

/**
 * Returns Philippine standard short date: "16/11/2026"
 */
export function formatPhilippineShortDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return formatInTimeZone(d, MANILA_TZ, 'dd/MM/yyyy');
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a timestamp with hours and minutes: "Nov 16, 2026 02:30 PM PHT"
 */
export function formatManilaDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '—';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return formatInTimeZone(d, MANILA_TZ, 'MMM d, yyyy h:mm a') + ' PHT';
  } catch {
    return String(dateInput);
  }
}

/**
 * Helper to display current semester or quarter label
 */
export function getReportingPeriodLabel(period: string, year: number = 2026): string {
  switch (period) {
    case 'SEM1':
      return `1st Semester ${year} (January - June ${year})`;
    case 'SEM2':
      return `2nd Semester ${year} (July - December ${year})`;
    case 'Q1':
      return `1st Quarter ${year} (Jan - Mar ${year})`;
    case 'Q2':
      return `2nd Quarter ${year} (Apr - Jun ${year})`;
    case 'Q3':
      return `3rd Quarter ${year} (Jul - Sep ${year})`;
    case 'Q4':
      return `4th Quarter ${year} (Oct - Dec ${year})`;
    default:
      return `All Reporting Periods (${year})`;
  }
}
