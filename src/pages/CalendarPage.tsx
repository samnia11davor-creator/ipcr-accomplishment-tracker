import React, { useState } from 'react';
import {
  Compass,
  Award,
  Plus,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { GoogleSheetCalendarView } from '@/components/calendar/GoogleSheetCalendarView';
import { LogFieldWorkModal } from '@/components/calendar/LogFieldWorkModal';
import { LogDailyTaskModal } from '@/components/calendar/LogDailyTaskModal';
import { useApp } from '@/contexts/AppContext';

export const CalendarPage: React.FC = () => {
  const { activities } = useApp();
  const [isDailyTaskOpen, setIsDailyTaskOpen] = useState(false);
  const [isFieldWorkOpen, setIsFieldWorkOpen] = useState(false);

  const activeActivities = activities.filter((a) => !a.isDeleted);
  const totalFieldWorks = activeActivities.filter((a) => a.isFieldWork);
  const totalFieldWorkUnits = totalFieldWorks.reduce(
    (acc, a) => acc + (a.fieldWorkCount || 1),
    0
  );
  const totalDocTasks = activeActivities.filter((a) => !a.isFieldWork);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Monthly Work Calendar & Field Work Tracker
            </h1>
            <Badge variant="emerald" size="sm">
              SM7 Sync Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Google Sheets-style monthly calendar view • Monitor daily tasks done and log recent field works contributing to SM7 (Submit Program of Works)
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsDailyTaskOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Log Work / Document Task
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsFieldWorkOpen(true)}
            leftIcon={<Compass className="w-4 h-4 text-emerald-700" />}
            className="border-emerald-300 text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 font-semibold shadow-xs"
          >
            + Log Field Work (SM7 POW)
          </Button>
        </div>
      </div>

      {/* Two-Stream IPCR Goal Supply Workflow Notice */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-blue-50/80 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              Integrated IPCR Accomplishment Supply Stream
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 font-mono font-bold">
                SM7 POW Rule
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              <strong>1. Daily Logsheet:</strong> Inputs & counts quantifiable documents (review memos, drawings, POW documents). &nbsp;|&nbsp;{' '}
              <strong>2. Monthly Calendar:</strong> Inputs field work investigations & site validation counts supplying{' '}
              <strong className="text-emerald-800">SM7. Submit Program of Work (FSDE)</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-emerald-200/80 shrink-0 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Doc Logs</span>
            <span className="font-bold text-blue-900">{totalDocTasks.length} outputs</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Field Works</span>
            <span className="font-bold text-emerald-900">
              {totalFieldWorks.length} ({totalFieldWorkUnits} sites)
            </span>
          </div>
        </div>
      </div>

      {/* Main Google Sheets Monthly Calendar */}
      <GoogleSheetCalendarView />

      {/* Field Work Modal */}
      <LogFieldWorkModal
        isOpen={isFieldWorkOpen}
        onClose={() => setIsFieldWorkOpen(false)}
      />

      {/* Daily Work / Document Task Modal */}
      <LogDailyTaskModal
        isOpen={isDailyTaskOpen}
        onClose={() => setIsDailyTaskOpen(false)}
      />
    </div>
  );
};
