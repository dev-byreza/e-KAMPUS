import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export {
  formatScore,
  formatPercent,
  getLetterGrade,
  GRADE_CONVERSION_TABLE,
  type LetterGradeInfo,
  getAcademicStatus,
  type AcademicStatusInfo,
} from "./calcEngine";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns current local time formatted in WITA (UTC+8) e.g., "10:24 WITA"
 */
export function getCurrentWitaTime(): string {
  const now = new Date();
  return (
    now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Makassar',
    }) + ' WITA'
  );
}

/**
 * Returns a human-friendly date string in Indonesian.
 */
export function formatIndoDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates and formats the exact calendar date for each of the 5 session days (dayOffset 0..4)
 * e.g., "2026-08-31" + 0 -> "31 Agustus 2026", + 1 -> "1 September 2026", etc.
 */
export function getSessionDate(startDateStr: string, dayOffset: number): string {
  try {
    const [year, month, day] = startDateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day + dayOffset);
    return targetDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return startDateStr;
  }
}
