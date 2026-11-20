// ============================================================================
// NIA Regional Office XI - Biometric DTR Parser
// Source: attendance.region11.nia.gov.ph/Biometrics
// ============================================================================

export interface BiometricPunch {
  id: string;
  rawDateTime: string; // e.g. "11/17/2026 08:28:17 AM"
  date: string; // YYYY-MM-DD
  timeStr: string; // "08:28:17 AM"
  displayTime: string; // "8:28 AM"
  machineName: string; // "Bio1" (Guard House) or "Web"
  employeeId?: string; // "176959"
  employeeName?: string; // "SAM LESTER R. TAGUIBAO"
  dateObj: Date;
}

export interface DailyDtrSummary {
  date: string; // YYYY-MM-DD
  timeIn?: string; // "08:28 AM"
  timeOut?: string; // "06:20 PM"
  lunchOut?: string;
  lunchIn?: string;
  totalHours: number; // Official credited hours (standard 8.0, max 8.0 unless OT)
  actualHours: number; // Raw span minus 1 hr lunch
  punchesCount: number;
  punches: BiometricPunch[];
  primaryMachine: string; // "Bio1" (Guard House) or "Web"
  isGuardHouseVerified: boolean;
}

/**
 * Parses raw copied table text or TSV from attendance.region11.nia.gov.ph/Biometrics
 */
export function parseNiaBiometricsText(rawText: string): DailyDtrSummary[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const punches: BiometricPunch[] = [];

  // Regex matches dates like:
  // 11/17/2026 06:20:30 PM
  // 11/17/2026 08:28:17 AM
  // 2026-11-17 08:28:17
  const dateTimeRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i;

  lines.forEach((line, index) => {
    // Skip table header lines
    if (
      line.toLowerCase().includes('date time') ||
      line.toLowerCase().includes('actions') ||
      line.toLowerCase().includes('temperature') ||
      line.toLowerCase().includes('attendance data')
    ) {
      return;
    }

    const match = line.match(dateTimeRegex);
    if (!match) return;

    const rawDatePart = match[1];
    const rawTimePart = match[2];
    const rawDateTime = `${rawDatePart} ${rawTimePart}`;

    // Normalize date to YYYY-MM-DD
    let normalizedDate = '';
    const dateParts = rawDatePart.split(/[\/\-]/);
    if (dateParts[0].length === 4) {
      // YYYY-MM-DD
      normalizedDate = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}`;
    } else {
      // MM/DD/YYYY
      normalizedDate = `${dateParts[2]}-${String(dateParts[0]).padStart(2, '0')}-${String(dateParts[1]).padStart(2, '0')}`;
    }

    // Try parsing Date object
    const dateObj = new Date(rawDateTime);
    const validDate = isNaN(dateObj.getTime()) ? new Date(`${normalizedDate}T12:00:00`) : dateObj;

    // Detect machine name: Bio1, Bio2, Web
    let machineName = 'Bio1';
    if (/bio\s*1/i.test(line)) machineName = 'Bio1';
    else if (/bio\s*2/i.test(line)) machineName = 'Bio2';
    else if (/web/i.test(line)) machineName = 'Web';

    // Detect Employee ID: e.g. 176959
    const empIdMatch = line.match(/\b(176\d{3}|\d{6})\b/);
    const employeeId = empIdMatch ? empIdMatch[1] : '176959';

    // Format display time (e.g. "8:28 AM")
    const displayTime = rawTimePart.replace(/:00\s*(AM|PM)/i, ' $1').replace(/(:\d{2}):\d{2}/, '$1');

    punches.push({
      id: `punch-${normalizedDate}-${validDate.getTime()}-${index}`,
      rawDateTime,
      date: normalizedDate,
      timeStr: rawTimePart,
      displayTime,
      machineName,
      employeeId,
      employeeName: 'SAM LESTER R. TAGUIBAO',
      dateObj: validDate,
    });
  });

  // Group punches by Date
  const dateMap = new Map<string, BiometricPunch[]>();
  punches.forEach((p) => {
    const list = dateMap.get(p.date) || [];
    list.push(p);
    dateMap.set(p.date, list);
  });

  // Build daily summaries
  const summaries: DailyDtrSummary[] = [];

  dateMap.forEach((dayPunches, date) => {
    // Sort chronologically (earliest to latest)
    dayPunches.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const firstPunch = dayPunches[0];
    const lastPunch = dayPunches[dayPunches.length - 1];

    const hasDistinctTimes = dayPunches.length > 1;
    const timeIn = firstPunch ? firstPunch.displayTime : undefined;
    const timeOut = hasDistinctTimes ? lastPunch.displayTime : undefined;

    // Calculate span in hours
    let actualHours = 0;
    if (hasDistinctTimes) {
      const diffMs = lastPunch.dateObj.getTime() - firstPunch.dateObj.getTime();
      const rawSpanHours = diffMs / (1000 * 60 * 60);
      // Deduct 1 hour for lunch if span is > 5 hours
      actualHours = rawSpanHours > 5 ? Math.max(0, rawSpanHours - 1.0) : rawSpanHours;
    } else {
      actualHours = 4.0; // single punch defaults to half-day or ongoing
    }

    // Standard official work hours credited (typically 8.0)
    const totalHours = Math.round(actualHours * 10) / 10;

    const hasGuardHouse = dayPunches.some((p) => p.machineName.startsWith('Bio'));
    const primaryMachine = hasGuardHouse ? 'Bio1 (Guard House)' : 'Web (Online Attendance)';

    summaries.push({
      date,
      timeIn,
      timeOut,
      totalHours: totalHours > 0 ? totalHours : 8.0,
      actualHours: Math.round(actualHours * 10) / 10,
      punchesCount: dayPunches.length,
      punches: dayPunches,
      primaryMachine,
      isGuardHouseVerified: hasGuardHouse,
    });
  });

  // Sort summaries descending (most recent date first)
  return summaries.sort((a, b) => b.date.localeCompare(a.date));
}

// Storage helpers
const DTR_STORAGE_KEY = 'ipcr_saved_dtr_summaries';

export function saveDtrSummaries(summaries: DailyDtrSummary[]): void {
  try {
    const existing = getSavedDtrSummaries();
    const map = new Map<string, DailyDtrSummary>();
    existing.forEach((s) => map.set(s.date, s));
    summaries.forEach((s) => map.set(s.date, s)); // Overwrite with fresh punches

    const merged = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    localStorage.setItem(DTR_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save DTR summaries to localStorage', e);
  }
}

export function getSavedDtrSummaries(): DailyDtrSummary[] {
  try {
    const raw = localStorage.getItem(DTR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDtrForDate(dateStr: string): DailyDtrSummary | undefined {
  const all = getSavedDtrSummaries();
  return all.find((s) => s.date === dateStr);
}

