import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Plus,
  Clock,
  Award,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useApp } from '@/contexts/AppContext';
import { DailyActivity, TaskAttachment } from '@/types';
import { LogDailyTaskModal } from './LogDailyTaskModal';
import { LogFieldWorkModal } from './LogFieldWorkModal';
import { DayDetailsModal } from './DayDetailsModal';
import { AttachmentViewerModal } from '@/components/common/AttachmentViewerModal';

interface GoogleSheetCalendarViewProps {
  onOpenDailyActivityModal?: (date?: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAY_NAMES = [
  { short: 'SUN', full: 'Sunday' },
  { short: 'MON', full: 'Monday' },
  { short: 'TUE', full: 'Tuesday' },
  { short: 'WED', full: 'Wednesday' },
  { short: 'THU', full: 'Thursday' },
  { short: 'FRI', full: 'Friday' },
  { short: 'SAT', full: 'Saturday' },
];

export const GoogleSheetCalendarView: React.FC<GoogleSheetCalendarViewProps> = ({
  onOpenDailyActivityModal,
  className = '',
}) => {
  const { activities, commitments } = useApp();

  // Active view date state (defaults to November 2026 or current active date)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = November (0-indexed)

  // Interactive modal states
  const [isDailyTaskModalOpen, setIsDailyTaskModalOpen] = useState(false);
  const [isFieldWorkModalOpen, setIsFieldWorkModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('');
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<string>('');
  const [viewingAttachment, setViewingAttachment] = useState<TaskAttachment | null>(null);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Build calendar matrix (Google Sheets grid structure)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(
        dayNum
      ).padStart(2, '0')}`;
      const dayOfWeek = new Date(prevYear, prevMonth, dayNum).getDay();

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
        d
      ).padStart(2, '0')}`;
      const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    // Trailing days from next month to complete standard 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    const totalTarget = days.length + remainingCells < 35 ? 35 : days.length + remainingCells;
    const needed = totalTarget - days.length;

    for (let nextDay = 1; nextDay <= needed; nextDay++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(
        nextDay
      ).padStart(2, '0')}`;
      const dayOfWeek = new Date(nextYear, nextMonth, nextDay).getDay();

      days.push({
        dateStr,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Aggregate monthly metrics
  const activeActivities = activities.filter((a) => !a.isDeleted);

  const monthActivities = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    return activeActivities.filter((a) => a.activityDate.startsWith(monthPrefix));
  }, [activeActivities, currentYear, currentMonth]);

  const monthCompleted = monthActivities.filter((a) => a.status === 'COMPLETED');
  const monthFieldWorks = monthActivities.filter((a) => a.isFieldWork);
  const monthFieldWorkUnits = monthFieldWorks.reduce(
    (acc, a) => acc + (a.fieldWorkCount || 1),
    0
  );
  const monthDocTasks = monthActivities.filter((a) => !a.isFieldWork);
  const monthTotalHours = monthActivities.reduce(
    (acc, a) => acc + (a.timeSpentHours || 0),
    0
  );

  // Group activities by date string for fast cell lookup
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, DailyActivity[]>();
    activeActivities.forEach((act) => {
      const existing = map.get(act.activityDate) || [];
      existing.push(act);
      map.set(act.activityDate, existing);
    });
    return map;
  }, [activeActivities]);

  // Find SM7 POW target information for banner
  const sm7powCommitment = commitments.find(
    (c) => c.commitmentCode === 'SM7-POW' || c.id === 'com-sm7-pow'
  );

  const handleCellClick = (dateStr: string) => {
    setSelectedDayForDetails(dateStr);
    setIsDayDetailsOpen(true);
  };

  const handleOpenDailyTask = (date?: string) => {
    const defaultDay = String(Math.min(new Date().getDate(), 28)).padStart(2, '0');
    setSelectedDateForModal(
      date ||
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${defaultDay}`
    );
    setIsDailyTaskModalOpen(true);
    if (onOpenDailyActivityModal) {
      onOpenDailyActivityModal(date);
    }
  };

  const handleOpenFieldWork = (date?: string) => {
    const defaultDay = String(Math.min(new Date().getDate(), 28)).padStart(2, '0');
    setSelectedDateForModal(
      date ||
        `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${defaultDay}`
    );
    setIsFieldWorkModalOpen(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* GOOGLE SHEETS CALENDAR HEADER & CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Title & Month Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-nia-50 text-nia-800 font-semibold border border-nia-200">
                2nd Semester (Jul - Dec 2026)
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct Daily Activity / Document Task Logger */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenDailyTask()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-nia-700 hover:bg-nia-800 text-white font-semibold shadow-xs"
            >
              + Log Work / Document Task
            </Button>

            {/* Direct Field Work Logger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenFieldWork()}
              leftIcon={<Compass className="w-4 h-4 text-emerald-700" />}
              className="border-emerald-300 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 font-semibold shadow-xs"
            >
              + Log Field Work (SM7)
            </Button>
          </div>
        </div>

        {/* GOOGLE SHEETS KPI / FORMULA SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Total Month Tasks
            </span>
            <div className="text-lg font-bold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{monthActivities.length}</span>
              <span className="text-xs font-semibold text-emerald-600">
                ({monthCompleted.length} done)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Quantifiable Documents
            </span>
            <div className="text-lg font-bold text-blue-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{monthDocTasks.length}</span>
              <span className="text-xs font-normal text-blue-600">doc logs</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Compass className="w-3 h-3 text-emerald-600" />
              Field Works (SM7 POW)
            </span>
            <div className="text-lg font-bold text-emerald-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{monthFieldWorks.length}</span>
              <span className="text-xs font-bold text-emerald-700">
                ({monthFieldWorkUnits} site visit{monthFieldWorkUnits === 1 ? '' : 's'})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Engineering Hours
            </span>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {monthTotalHours.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
          </div>
        </div>

        {/* SM7 POW Contribution Note */}
        {sm7powCommitment && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Goal Correlation:</strong> Field work logged in this calendar directly updates{' '}
                <span className="font-mono font-bold text-emerald-800">[SM7-POW]</span>{' '}
                <em>(Target: {sm7powCommitment.target})</em>.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 hidden sm:inline">
              Quantifiable Documents + Field Work Sites
            </span>
          </div>
        )}
      </div>

      {/* GOOGLE SHEETS SPREADSHEET CALENDAR GRID */}
      <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm bg-white rounded-2xl">
        {/* Table / Grid Header: Sunday to Saturday */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90 text-center select-none font-mono text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {WEEKDAY_NAMES.map((wd, idx) => (
            <div
              key={wd.short}
              className={`py-2.5 px-1 border-r last:border-r-0 border-slate-200 ${
                idx === 0 || idx === 6 ? 'bg-slate-100/70 text-slate-500' : ''
              }`}
            >
              <span className="hidden sm:inline">{wd.full}</span>
              <span className="sm:hidden">{wd.short}</span>
            </div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
          {calendarDays.map((day) => {
            const dayActs = activitiesByDate.get(day.dateStr) || [];
            const dayFieldWorks = dayActs.filter((a) => a.isFieldWork);
            const dayDocTasks = dayActs.filter((a) => !a.isFieldWork);
            const totalHours = dayActs.reduce((acc, a) => acc + (a.timeSpentHours || 0), 0);
            const hasActivities = dayActs.length > 0;

            return (
              <div
                key={day.dateStr}
                onClick={() => handleCellClick(day.dateStr)}
                className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 bg-white flex flex-col justify-between transition-all cursor-pointer group hover:bg-slate-50 relative ${
                  !day.isCurrentMonth
                    ? 'bg-slate-50/60 text-slate-400'
                    : day.isWeekend
                    ? 'bg-slate-50/30'
                    : 'bg-white'
                }`}
              >
                {/* Cell Header: Day Number & Task Count Badge */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-mono font-bold w-6 h-6 rounded-full transition-all ${
                      day.isToday
                        ? 'bg-nia-700 text-white shadow-xs'
                        : day.isCurrentMonth
                        ? 'text-slate-800 group-hover:text-nia-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Task Count Badge for Day */}
                  <div className="flex items-center gap-1">
                    {hasActivities && (
                      <>
                        {dayFieldWorks.length > 0 && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5"
                            title={`${dayFieldWorks.length} Field Work(s)`}
                          >
                            <Compass className="w-2.5 h-2.5 text-emerald-700" />
                            <span>{dayFieldWorks.length}</span>
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {dayActs.length} {dayActs.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </>
                    )}

                    {/* Quick action buttons on hover for every cell */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity ml-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDailyTask(day.dateStr);
                        }}
                        className="p-1 rounded hover:bg-nia-100 text-nia-700 transition-colors"
                        title="Add Document / Work Task on this date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFieldWork(day.dateStr);
                        }}
                        className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Add Field Work (SM7) on this date"
                      >
                        <Compass className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cell Body: Task Chips */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {/* 1. Field Work Chips (Prominent Emerald) */}
                  {dayFieldWorks.slice(0, 2).map((fw) => (
                    <div
                      key={fw.id}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-950 text-[10px] font-medium leading-tight truncate shadow-2xs hover:bg-emerald-100/70"
                      title={`Field Work: [${fw.project}] ${fw.output}`}
                    >
                      <span className="font-bold text-emerald-800">🌾 [{fw.project || 'Field'}] </span>
                      <span>{fw.fieldWorkType || fw.output}</span>
                    </div>
                  ))}

                  {/* 2. Document Task Chips (Clean Slate/Blue) */}
                  {dayDocTasks.slice(0, dayFieldWorks.length > 0 ? 1 : 2).map((doc) => (
                    <div
                      key={doc.id}
                      className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-800 text-[10px] leading-tight truncate hover:bg-blue-50/50"
                      title={`[${doc.project}] ${doc.description}`}
                    >
                      <span className="font-semibold text-slate-700">📄 [{doc.project || 'Project'}] </span>
                      <span>{doc.description}</span>
                    </div>
                  ))}

                  {/* More indicator */}
                  {dayActs.length > (dayFieldWorks.length > 0 ? 2 : 2) && (
                    <div className="text-[10px] font-semibold text-slate-500 pl-1">
                      +{dayActs.length - 2} more...
                    </div>
                  )}
                </div>

                {/* Cell Footer: Hours */}
                {totalHours > 0 && (
                  <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{totalHours.toFixed(1)}h</span>
                    <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Interactive Modals */}
      <LogDailyTaskModal
        isOpen={isDailyTaskModalOpen}
        onClose={() => setIsDailyTaskModalOpen(false)}
        initialDate={selectedDateForModal}
      />

      <LogFieldWorkModal
        isOpen={isFieldWorkModalOpen}
        onClose={() => setIsFieldWorkModalOpen(false)}
        initialDate={selectedDateForModal}
      />

      <DayDetailsModal
        isOpen={isDayDetailsOpen}
        onClose={() => setIsDayDetailsOpen(false)}
        dateStr={selectedDayForDetails}
        activities={activities}
        onOpenFieldWorkModal={(d) => handleOpenFieldWork(d)}
        onOpenActivityModal={(d) => handleOpenDailyTask(d)}
        onViewAttachment={(att) => setViewingAttachment(att)}
      />

      {viewingAttachment && (
        <AttachmentViewerModal
          attachment={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </div>
  );
};
