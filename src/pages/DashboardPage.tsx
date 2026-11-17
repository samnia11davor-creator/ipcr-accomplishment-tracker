import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Target,
  FileCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Paperclip,
  Plus,
  ArrowUpRight,
  BarChart3,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/contexts/AppContext';
import { TaskAttachment } from '@/types';
import { AttachmentViewerModal } from '@/components/common/AttachmentViewerModal';
import { StorageMonitorPill } from '@/components/common/StorageMonitorPill';

const MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities,
    commitments,
    documents,
    selectedPeriod,
    setSelectedPeriod,
  } = useApp();

  // Interactive UI States
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'COMPLETED' | 'ONGOING' | 'PENDING_AI'>('ALL');
  const [activeTierTab, setActiveTierTab] = useState<'ALL' | 'STRATEGIC' | 'CORE' | 'SUPPORT'>('ALL');
  const [expandedCommitmentId, setExpandedCommitmentId] = useState<string | null>(null);
  const [viewingAttachment, setViewingAttachment] = useState<TaskAttachment | null>(null);

  // Active records
  const activeActivities = useMemo(() => activities.filter((a) => !a.isDeleted), [activities]);
  const activeDocuments = useMemo(() => documents.filter((d) => !d.isDeleted), [documents]);

  // Semester Date bounds
  const semDateRange = useMemo(() => {
    if (selectedPeriod === 'SEM1') return { start: '2026-01-01', end: '2026-06-30' };
    return { start: '2026-07-01', end: '2026-12-31' };
  }, [selectedPeriod]);

  // Semester activities
  const semesterActivities = useMemo(() => {
    return activeActivities.filter((a) => {
      const d = a.activityDate;
      return d >= semDateRange.start && d <= semDateRange.end;
    });
  }, [activeActivities, semDateRange]);

  // Distinct months in this semester
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    semesterActivities.forEach((a) => {
      if (a.activityDate) {
        monthsSet.add(a.activityDate.slice(0, 7)); // "2026-07"
      }
    });

    // If empty, supply standard semester months
    if (monthsSet.size === 0) {
      if (selectedPeriod === 'SEM1') {
        ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'].forEach((m) => monthsSet.add(m));
      } else {
        ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'].forEach((m) => monthsSet.add(m));
      }
    }

    return Array.from(monthsSet).sort();
  }, [semesterActivities, selectedPeriod]);

  // Filtered Activities based on interactive controls
  const filteredActivities = useMemo(() => {
    return semesterActivities.filter((act) => {
      // Month
      if (selectedMonthFilter !== 'ALL' && !act.activityDate.startsWith(selectedMonthFilter)) {
        return false;
      }
      // Project
      if (selectedProjectFilter !== 'ALL' && act.project !== selectedProjectFilter) {
        return false;
      }
      // Status
      if (selectedStatusFilter === 'COMPLETED' && act.status !== 'COMPLETED') return false;
      if (selectedStatusFilter === 'ONGOING' && act.status !== 'ONGOING') return false;
      if (selectedStatusFilter === 'PENDING_AI' && act.classificationStatus !== 'PENDING') return false;

      return true;
    });
  }, [semesterActivities, selectedMonthFilter, selectedProjectFilter, selectedStatusFilter]);

  // Top KPIs
  const totalCount = filteredActivities.length;
  const completedCount = filteredActivities.filter((a) => a.status === 'COMPLETED').length;
  const ongoingCount = filteredActivities.filter((a) => a.status === 'ONGOING').length;
  const totalHoursLogged = filteredActivities.reduce((acc, a) => acc + (a.timeSpentHours || 4.0), 0);
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Documents
  const pendingDocs = activeDocuments.filter((d) => d.status === 'Pending' || d.status === 'On-going');

  // SPMS Commitments Breakdown
  const strategicCommitments = useMemo(() => commitments.filter((c) => c.tier === 'STRATEGIC'), [commitments]);
  const coreCommitments = useMemo(() => commitments.filter((c) => c.tier === 'CORE'), [commitments]);
  const supportCommitments = useMemo(() => commitments.filter((c) => c.tier === 'SUPPORT'), [commitments]);

  // Tier-filtered commitments
  const displayedCommitments = useMemo(() => {
    if (activeTierTab === 'STRATEGIC') return strategicCommitments;
    if (activeTierTab === 'CORE') return coreCommitments;
    if (activeTierTab === 'SUPPORT') return supportCommitments;
    return commitments;
  }, [activeTierTab, strategicCommitments, coreCommitments, supportCommitments, commitments]);

  // Target Coverage
  const zeroAccomplishments = useMemo(() => {
    return commitments.filter((c) => {
      const acts = activeActivities.filter((a) => a.commitmentId === c.id && a.status === 'COMPLETED');
      return acts.length === 0;
    });
  }, [commitments, activeActivities]);

  const targetCoveragePercent = commitments.length > 0
    ? Math.round(((commitments.length - zeroAccomplishments.length) / commitments.length) * 100)
    : 0;

  // Project Distribution (Top projects)
  const projectStats = useMemo(() => {
    const map = new Map<string, { project: string; count: number; hours: number; completed: number }>();

    filteredActivities.forEach((act) => {
      const proj = act.project?.trim() || 'General / Section Work';
      const existing = map.get(proj) || { project: proj, count: 0, hours: 0, completed: 0 };
      existing.count += 1;
      existing.hours += act.timeSpentHours || 4.0;
      if (act.status === 'COMPLETED') existing.completed += 1;
      map.set(proj, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [filteredActivities]);

  // Monthly Velocity Data for SVG bar chart
  const monthlyVelocity = useMemo(() => {
    return availableMonths.map((mStr) => {
      const monthPart = mStr.slice(5, 7);
      const label = MONTH_NAMES[monthPart]?.slice(0, 3) || mStr;
      const acts = semesterActivities.filter((a) => a.activityDate.startsWith(mStr));
      const completed = acts.filter((a) => a.status === 'COMPLETED').length;
      const ongoing = acts.filter((a) => a.status === 'ONGOING').length;
      const hours = acts.reduce((acc, a) => acc + (a.timeSpentHours || 4.0), 0);

      return {
        monthKey: mStr,
        label,
        total: acts.length,
        completed,
        ongoing,
        hours,
      };
    });
  }, [availableMonths, semesterActivities]);

  const maxMonthTotal = Math.max(...monthlyVelocity.map((m) => m.total), 5);

  // Reset interactive filters
  const resetFilters = () => {
    setSelectedMonthFilter('ALL');
    setSelectedProjectFilter('ALL');
    setSelectedStatusFilter('ALL');
  };

  const hasActiveFilter =
    selectedMonthFilter !== 'ALL' ||
    selectedProjectFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Top Banner / Semester Switcher / Interactive Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Accomplishment Dashboard
            </h1>
            <Badge variant="blue" size="sm">
              NIA Region XI
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Civil Engineering Work Monitoring • SPMS Targets • Planning & Design Section
          </p>
        </div>

        {/* Action Controls & Semester Selector */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <StorageMonitorPill variant="compact" />

          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-xs text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-nia-600" />
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value);
                setSelectedMonthFilter('ALL');
              }}
              className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="SEM2">2nd Semester 2026 (Jul - Dec)</option>
              <option value="SEM1">1st Semester 2026 (Jan - Jun)</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/activities')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* Interactive Monthly Timeline Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" />
            Month:
          </span>
          <button
            onClick={() => setSelectedMonthFilter('ALL')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all shrink-0 ${
              selectedMonthFilter === 'ALL'
                ? 'bg-nia-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Months ({semesterActivities.length})
          </button>

          {availableMonths.map((mStr) => {
            const monthCode = mStr.slice(5, 7);
            const name = MONTH_NAMES[monthCode] || mStr;
            const count = semesterActivities.filter((a) => a.activityDate.startsWith(mStr)).length;
            const isSelected = selectedMonthFilter === mStr;

            return (
              <button
                key={mStr}
                onClick={() => setSelectedMonthFilter(isSelected ? 'ALL' : mStr)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-nia-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {hasActiveFilter && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Primary KPI Metric Cards (Interactive click-to-filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deliverables */}
        <Card
          padding="md"
          className={`cursor-pointer transition-all border-l-4 ${
            selectedStatusFilter === 'ALL'
              ? 'border-l-nia-600 shadow-sm ring-2 ring-nia-500/20'
              : 'border-l-nia-600 hover:shadow-md'
          }`}
          onClick={() => setSelectedStatusFilter('ALL')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Deliverables
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {totalCount}
              </h3>
              <p className="text-[11px] text-nia-700 font-semibold mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-nia-600" />
                <span>{totalHoursLogged.toFixed(1)} Engineering Hours</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-nia-50 text-nia-700 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Completed Deliverables */}
        <Card
          padding="md"
          className={`cursor-pointer transition-all border-l-4 ${
            selectedStatusFilter === 'COMPLETED'
              ? 'border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
              : 'border-l-emerald-500 hover:shadow-md'
          }`}
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Completed Deliverables
              </p>
              <h3 className="text-2xl font-black text-emerald-800 mt-1">
                {completedCount}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">
                {completionRate}% execution velocity
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Ongoing / In Progress */}
        <Card
          padding="md"
          className={`cursor-pointer transition-all border-l-4 ${
            selectedStatusFilter === 'ONGOING'
              ? 'border-l-blue-600 shadow-sm ring-2 ring-blue-500/20'
              : 'border-l-blue-500 hover:shadow-md'
          }`}
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'ONGOING' ? 'ALL' : 'ONGOING')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Ongoing Work
              </p>
              <h3 className="text-2xl font-black text-blue-800 mt-1">
                {ongoingCount}
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">
                Active FSR, DED & technical reviews
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Target Coverage / Health */}
        <Card
          padding="md"
          className={`border-l-4 ${
            zeroAccomplishments.length > 0 ? 'border-l-amber-500' : 'border-l-emerald-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                IPCR Target Coverage
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {targetCoveragePercent}%
              </h3>
              <p className="text-[11px] font-semibold mt-1">
                {zeroAccomplishments.length === 0 ? (
                  <span className="text-emerald-700 font-bold">100% Targets Covered</span>
                ) : (
                  <span className="text-amber-700 font-bold">
                    {zeroAccomplishments.length} target(s) with 0 output
                  </span>
                )}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shadow-xs">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Visual Engineering Charts & Project Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Deliverable Velocity Chart (2 cols) */}
        <Card padding="none" className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-nia-600" />
                Monthly Deliverable Velocity & Output Trend
              </CardTitle>
              <CardDescription>
                Completed deliverables and engineering hours per month • Click any month bar to filter
              </CardDescription>
            </div>
            <Badge variant="blue">{selectedPeriod} 2026</Badge>
          </CardHeader>

          <div className="p-5 space-y-4">
            {/* SVG Visual Bar Chart */}
            <div className="grid grid-cols-6 gap-3 items-end h-40 pt-4 px-2 border-b border-slate-200">
              {monthlyVelocity.map((m) => {
                const heightPct = Math.round((m.total / maxMonthTotal) * 100);
                const isSelected = selectedMonthFilter === m.monthKey;

                return (
                  <div
                    key={m.monthKey}
                    onClick={() => setSelectedMonthFilter(isSelected ? 'ALL' : m.monthKey)}
                    className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                    title={`${m.label}: ${m.completed} completed, ${m.ongoing} ongoing (${m.hours.toFixed(1)} hrs)`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 opacity-80 group-hover:opacity-100 group-hover:text-nia-700">
                      {m.total}
                    </span>

                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-full flex flex-col justify-end p-0.5 overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 flex flex-col justify-end ${
                          isSelected
                            ? 'bg-nia-700 ring-2 ring-nia-500'
                            : 'bg-nia-500 hover:bg-nia-600'
                        }`}
                        style={{ height: `${Math.max(heightPct, 6)}%` }}
                      >
                        {m.completed > 0 && (
                          <div
                            className="bg-emerald-500 w-full rounded-t-md"
                            style={{
                              height: `${Math.round((m.completed / Math.max(m.total, 1)) * 100)}%`,
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold transition-colors ${
                        isSelected
                          ? 'text-nia-800 underline'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Stats */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Completed Works
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-nia-500 inline-block" /> Ongoing / In-Review
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Tip: Click month column to drill down
              </span>
            </div>
          </div>
        </Card>

        {/* Right: Top Irrigation Projects Distribution (1 col) */}
        <Card padding="none" className="flex flex-col">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-nia-600" />
                Work by Region XI Project
              </CardTitle>
              <CardDescription>Engineering hours allocated per system</CardDescription>
            </div>
            {selectedProjectFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedProjectFilter('ALL')}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Clear
              </button>
            )}
          </CardHeader>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[290px] divide-y divide-slate-100">
            {projectStats.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No project logs recorded for this period.
              </div>
            ) : (
              projectStats.slice(0, 6).map((item) => {
                const isSelected = selectedProjectFilter === item.project;
                const hoursPct = Math.min(100, Math.round((item.hours / Math.max(totalHoursLogged, 1)) * 100));

                return (
                  <div
                    key={item.project}
                    onClick={() => setSelectedProjectFilter(isSelected ? 'ALL' : item.project)}
                    className={`pt-2.5 first:pt-0 cursor-pointer group transition-colors p-2 rounded-xl ${
                      isSelected ? 'bg-nia-50 border border-nia-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-800 truncate max-w-[170px] group-hover:text-nia-700">
                        {item.project}
                      </span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {item.hours.toFixed(1)} hrs ({hoursPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSelected ? 'bg-nia-700' : 'bg-nia-500'
                        }`}
                        style={{ width: `${Math.max(hoursPct, 4)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{item.count} total tasks</span>
                      <span className="text-emerald-700 font-medium">{item.completed} completed</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: SPMS 3-Tier Commitment Progress & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: SPMS 3-Tier IPCR Commitment Realization (2 cols) */}
        <Card padding="none" className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-nia-600" />
                SPMS IPCR Target Realization (I, II, III)
              </CardTitle>
              <CardDescription>
                Progress tracking grouped by CSC & NIA SPMS Objective categories
              </CardDescription>
            </div>

            {/* Tier Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTierTab('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTierTab === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({commitments.length})
              </button>
              <button
                onClick={() => setActiveTierTab('STRATEGIC')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTierTab === 'STRATEGIC'
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                I. Strategic ({strategicCommitments.length})
              </button>
              <button
                onClick={() => setActiveTierTab('CORE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTierTab === 'CORE'
                    ? 'bg-white text-blue-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                II. Core ({coreCommitments.length})
              </button>
              <button
                onClick={() => setActiveTierTab('SUPPORT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeTierTab === 'SUPPORT'
                    ? 'bg-white text-emerald-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                III. Support ({supportCommitments.length})
              </button>
            </div>
          </CardHeader>

          <div className="p-5 divide-y divide-slate-100 space-y-4 max-h-[580px] overflow-y-auto">
            {displayedCommitments.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No commitments assigned to this tier category.
              </div>
            ) : (
              displayedCommitments.map((com) => {
                const matchedActivities = activeActivities.filter(
                  (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
                );
                const ongoingActivities = activeActivities.filter(
                  (a) => a.commitmentId === com.id && a.status === 'ONGOING'
                );
                const docMatches = matchedActivities.filter((a) => !a.isFieldWork);
                const fieldMatches = matchedActivities.filter((a) => a.isFieldWork);
                const fieldWorkUnits = fieldMatches.reduce(
                  (acc, a) => acc + (a.fieldWorkCount || 1),
                  0
                );
                const count = docMatches.length + fieldWorkUnits;
                const targetNum = com.numericalTarget || 1;
                const pct = Math.min(100, Math.round((count / targetNum) * 100));
                const isExpanded = expandedCommitmentId === com.id;

                const romanTier =
                  com.tier === 'STRATEGIC'
                    ? 'I'
                    : com.tier === 'CORE'
                    ? 'II'
                    : 'III';

                return (
                  <div key={com.id} className="pt-3.5 first:pt-0 space-y-2">
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedCommitmentId(isExpanded ? null : com.id)}
                      className="flex items-center justify-between text-xs font-semibold text-slate-800 cursor-pointer hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-3">
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                            com.tier === 'STRATEGIC'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : com.tier === 'CORE'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {romanTier}. {com.commitmentCode}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 truncate block">
                            {com.mfoPap}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`font-mono text-xs font-bold ${
                              pct === 100
                                ? 'text-emerald-700'
                                : pct === 0
                                ? 'text-rose-600'
                                : 'text-nia-700'
                            }`}
                          >
                            {count} / {com.numericalTarget} ({pct}%)
                          </span>
                          {fieldWorkUnits > 0 && (
                            <div className="text-[10px] text-emerald-700 font-bold">
                              {docMatches.length} docs + {fieldWorkUnits} field
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct === 100
                            ? 'bg-emerald-600'
                            : pct === 0
                            ? 'bg-rose-500'
                            : 'bg-nia-600'
                        }`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>

                    {/* Narrative & Quick Context */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span className="truncate max-w-md text-slate-600">
                        {com.successIndicator}
                      </span>
                      <span className={count === 0 ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}>
                        {count === 0 ? '⚠️ Zero accomplishments' : `${count} verified log(s)`}
                      </span>
                    </div>

                    {/* EXPANDABLE CONTRIBUTING ACTIVITIES DRAWER */}
                    {isExpanded && (
                      <div className="mt-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Validated Tasks for this Target ({count} Completed, {ongoingActivities.length} Ongoing)
                          </span>

                          <button
                            onClick={() => navigate('/activities')}
                            className="text-[11px] font-bold text-nia-700 hover:text-nia-900 flex items-center gap-1"
                          >
                            <span>+ Log Task for this Goal</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>

                        {matchedActivities.length === 0 ? (
                          <div className="text-center py-3 text-slate-400">
                            <p className="text-[11px]">No completed accomplishments logged under this commitment yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {matchedActivities.map((act) => (
                              <div
                                key={act.id}
                                className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                              >
                                <div className="truncate mr-2">
                                  <span className="font-semibold text-slate-900">
                                    [{act.project || 'General'}]
                                  </span>{' '}
                                  <span className="text-slate-600 truncate">{act.output}</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                  {act.activityDate}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right: DOC LOG Queue & Quick Actions (1 col) */}
        <div className="space-y-5">
          {/* Pending DOC LOG Ledger */}
          <Card padding="none">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                  DOC LOG Action Queue
                </CardTitle>
                <CardDescription>Incoming & pending documents to review</CardDescription>
              </div>
              <Badge variant={pendingDocs.length > 0 ? 'amber' : 'emerald'}>
                {pendingDocs.length} Pending
              </Badge>
            </CardHeader>

            <div className="p-4 space-y-2.5 max-h-[320px] overflow-y-auto divide-y divide-slate-100">
              {pendingDocs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  All correspondence processed and up to date!
                </div>
              ) : (
                pendingDocs.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="pt-2 first:pt-0 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900 truncate max-w-[170px]">
                        {doc.documentType}
                      </span>
                      <Badge variant={doc.status === 'On-going' ? 'blue' : 'amber'} size="sm">
                        {doc.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {doc.description}
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Sender: {doc.senderSource}</span>
                      <span className="text-nia-700 font-semibold">{doc.project || 'RO-XI'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <button
                onClick={() => navigate('/documents')}
                className="text-xs font-bold text-nia-700 hover:text-nia-900 flex items-center justify-center gap-1 mx-auto"
              >
                <span>Open Full DOC LOG SHEET Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>

          {/* Report Generator Banner */}
          <Card padding="md" className="bg-gradient-to-br from-nia-900 to-slate-900 text-white shadow-md">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Official Form 13 Report Engine
            </h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Consolidate your {semesterActivities.length} daily logs under approved IPCR commitments and generate CSC/NIA compliant Excel, Word, and PDF reports.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/70 flex items-center justify-between">
              <span className="text-xs text-sky-300 font-semibold">Ready for Review</span>
              <Button
                size="sm"
                variant="primary"
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs"
                onClick={() => navigate('/reports')}
              >
                Generate IPCR Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 4: Live Recent Activity Feed with Direct Lightbox Preview */}
      <Card padding="none">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-nia-600" />
              Recent Validated Engineering Logs ({filteredActivities.length})
            </CardTitle>
            <CardDescription>
              Chronological stream of daily work with attachments & assigned IPCR commitments
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/activities')}
          >
            View in Logsheet
          </Button>
        </CardHeader>

        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No daily activities match the current filters.
            </div>
          ) : (
            filteredActivities.slice(0, 8).map((act) => {
              const matchedCom = commitments.find((c) => c.id === act.commitmentId);
              const romanTier =
                matchedCom?.tier === 'STRATEGIC'
                  ? 'I'
                  : matchedCom?.tier === 'CORE'
                  ? 'II'
                  : matchedCom?.tier === 'SUPPORT'
                  ? 'III'
                  : '';

              return (
                <div
                  key={act.id}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800">
                        {act.activityDate}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-nia-800">
                        {act.project || 'General / Section Work'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                        {act.category}
                      </span>
                      {act.imoLocation && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                          {act.imoLocation}
                        </span>
                      )}
                    </div>

                    <p className="text-slate-800 font-medium line-clamp-1 leading-snug">
                      {act.output}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {act.description}
                    </p>
                  </div>

                  {/* Right side: Goal Badge, Attachments & Status */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {/* Attachments Preview Button */}
                    {act.attachments && act.attachments.length > 0 && (
                      <button
                        onClick={() => setViewingAttachment(act.attachments![0])}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold hover:bg-purple-100 transition-colors shadow-xs"
                        title={`${act.attachments.length} attachment(s) • Click to preview`}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{act.attachments.length}</span>
                      </button>
                    )}

                    {/* Assigned Target */}
                    {matchedCom ? (
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          matchedCom.tier === 'STRATEGIC'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : matchedCom.tier === 'CORE'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {romanTier}. {matchedCom.commitmentCode}
                      </span>
                    ) : (
                      <Badge variant="rose" size="sm">
                        Unclassified
                      </Badge>
                    )}

                    <Badge
                      variant={
                        act.status === 'COMPLETED'
                          ? 'emerald'
                          : act.status === 'ONGOING'
                          ? 'blue'
                          : 'slate'
                      }
                      size="sm"
                      dot
                    >
                      {act.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Attachment Lightbox Modal */}
      {viewingAttachment && (
        <AttachmentViewerModal
          attachment={viewingAttachment}
          onClose={() => setViewingAttachment(null)}
        />
      )}
    </div>
  );
};
