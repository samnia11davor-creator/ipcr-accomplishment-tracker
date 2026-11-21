import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Target,
  Calendar,
  FolderGit2,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Compass,
  FileCheck2,
  Sparkles,
  ChevronRight,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/contexts/AppContext';
import { StorageMonitorPill } from '@/components/common/StorageMonitorPill';
import { IpcrCommitment } from '@/types';

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activities,
    commitments,
    selectedPeriod,
    setSelectedPeriod,
  } = useApp();

  // Active view filters
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');

  // Active records
  const activeActivities = useMemo(() => activities.filter((a) => !a.isDeleted), [activities]);

  // Semester Date bounds
  const semDateRange = useMemo(() => {
    if (selectedPeriod === 'SEM1') return { start: '2026-01-01', end: '2026-06-30', label: '1st Sem (Jan - Jun 2026)' };
    return { start: '2026-07-01', end: '2026-12-31', label: '2nd Sem (Jul - Dec 2026)' };
  }, [selectedPeriod]);

  // Semester activities
  const semesterActivities = useMemo(() => {
    return activeActivities.filter((a) => {
      const d = a.activityDate;
      return d >= semDateRange.start && d <= semDateRange.end;
    });
  }, [activeActivities, semDateRange]);

  // Distinct months in this semester
  const semesterMonths = useMemo(() => {
    if (selectedPeriod === 'SEM1') {
      return ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    }
    return ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
  }, [selectedPeriod]);

  // Filtered by selected month (if any)
  const displayedActivities = useMemo(() => {
    if (selectedMonthFilter === 'ALL') return semesterActivities;
    return semesterActivities.filter((a) => a.activityDate.startsWith(selectedMonthFilter));
  }, [semesterActivities, selectedMonthFilter]);

  // Top KPIs (Pure Deliverables & IPCR outputs, NO timesheet hours!)
  const totalDeliverables = displayedActivities.length;
  const completedDeliverables = displayedActivities.filter((a) => a.status === 'COMPLETED').length;
  const ongoingDeliverables = displayedActivities.filter((a) => a.status === 'ONGOING').length;
  const fieldWorkCount = displayedActivities.filter((a) => a.isFieldWork).length;
  const completionRate = totalDeliverables > 0 ? Math.round((completedDeliverables / totalDeliverables) * 100) : 0;

  // SPMS Tiers Breakdown
  const strategicCommitments = useMemo(() => commitments.filter((c) => c.tier === 'STRATEGIC'), [commitments]);
  const coreCommitments = useMemo(() => commitments.filter((c) => c.tier === 'CORE'), [commitments]);
  const supportCommitments = useMemo(() => commitments.filter((c) => c.tier === 'SUPPORT'), [commitments]);

  // Tier progress calculations
  const calculateTierProgress = (tierCommitments: IpcrCommitment[]) => {
    let totalTarget = 0;
    let totalAccomplished = 0;

    tierCommitments.forEach((com) => {
      const target = com.numericalTarget || 1;
      totalTarget += target;

      const matched = activeActivities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
      );
      const docs = matched.filter((a) => !a.isFieldWork).length;
      const field = matched.filter((a) => a.isFieldWork).reduce((acc, a) => acc + (a.fieldWorkCount || 1), 0);
      totalAccomplished += Math.min(target, docs + field);
    });

    const percent = totalTarget > 0 ? Math.min(100, Math.round((totalAccomplished / totalTarget) * 100)) : 0;
    return { target: totalTarget, accomplished: totalAccomplished, percent };
  };

  const strategicStats = useMemo(() => calculateTierProgress(strategicCommitments), [strategicCommitments, activeActivities]);
  const coreStats = useMemo(() => calculateTierProgress(coreCommitments), [coreCommitments, activeActivities]);
  const supportStats = useMemo(() => calculateTierProgress(supportCommitments), [supportCommitments, activeActivities]);

  // Overall SPMS Performance Rating Estimation (CSC Standard Weights: Strategic 35%, Core 55%, Support 10%)
  const weightedAccomplishment = useMemo(() => {
    const s = strategicStats.percent * 0.35;
    const c = coreStats.percent * 0.55;
    const sup = supportStats.percent * 0.10;
    return Math.round(s + c + sup);
  }, [strategicStats, coreStats, supportStats]);

  const expectedRating = useMemo(() => {
    if (weightedAccomplishment >= 95) return { score: '4.85', text: 'Outstanding (O)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (weightedAccomplishment >= 80) return { score: '4.20', text: 'Very Satisfactory (VS)', color: 'text-nia-700 bg-nia-50 border-nia-300' };
    if (weightedAccomplishment >= 60) return { score: '3.40', text: 'Satisfactory (S)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { score: '2.50', text: 'Unsatisfactory (US)', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  }, [weightedAccomplishment]);

  // Monthly Output Trajectory (Graph 1 Data)
  const monthlyVelocity = useMemo(() => {
    return semesterMonths.map((mStr) => {
      const monthPart = mStr.slice(5, 7);
      const label = MONTH_NAMES[monthPart] || mStr;
      const acts = semesterActivities.filter((a) => a.activityDate.startsWith(mStr));
      const completed = acts.filter((a) => a.status === 'COMPLETED').length;
      const ongoing = acts.filter((a) => a.status === 'ONGOING').length;
      const fieldWorks = acts.filter((a) => a.isFieldWork).length;

      return {
        monthKey: mStr,
        label,
        total: acts.length,
        completed,
        ongoing,
        fieldWorks,
      };
    });
  }, [semesterMonths, semesterActivities]);

  const maxMonthTotal = Math.max(...monthlyVelocity.map((m) => m.total), 6);

  // Project Distribution (Graph 2 Data - Deliverables count, NO hours!)
  const projectDistribution = useMemo(() => {
    const map = new Map<string, { project: string; count: number; completed: number; fieldWorks: number }>();

    semesterActivities.forEach((act) => {
      const proj = act.project?.trim() || 'General / Section Work';
      const existing = map.get(proj) || { project: proj, count: 0, completed: 0, fieldWorks: 0 };
      existing.count += 1;
      if (act.status === 'COMPLETED') existing.completed += 1;
      if (act.isFieldWork) existing.fieldWorks += 1;
      map.set(proj, existing);
    });

    const list = Array.from(map.values()).sort((a, b) => b.completed - a.completed);
    const topProjects = list.slice(0, 5);
    const otherProjects = list.slice(5);

    if (otherProjects.length > 0) {
      const otherCount = otherProjects.reduce((acc, p) => acc + p.count, 0);
      const otherCompleted = otherProjects.reduce((acc, p) => acc + p.completed, 0);
      const otherFw = otherProjects.reduce((acc, p) => acc + p.fieldWorks, 0);
      topProjects.push({ project: `Other Projects (${otherProjects.length})`, count: otherCount, completed: otherCompleted, fieldWorks: otherFw });
    }

    return topProjects;
  }, [semesterActivities]);

  // Target Health & Attention Monitor
  const targetHealth = useMemo(() => {
    return commitments.map((com) => {
      const target = com.numericalTarget || 1;
      const matched = activeActivities.filter(
        (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
      );
      const docCount = matched.filter((a) => !a.isFieldWork).length;
      const fieldCount = matched.filter((a) => a.isFieldWork).reduce((acc, a) => acc + (a.fieldWorkCount || 1), 0);
      const actual = docCount + fieldCount;
      const percent = Math.min(100, Math.round((actual / target) * 100));

      return {
        commitment: com,
        actual,
        target,
        percent,
        isCompleted: actual >= target,
      };
    });
  }, [commitments, activeActivities]);

  const completedTargetsCount = targetHealth.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Executive IPCR Dashboard
            </h1>
            <Badge variant="blue" size="sm">
              NIA Region XI
            </Badge>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${expectedRating.color}`}>
              {expectedRating.score} • {expectedRating.text}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Civil Engineering Work Realization • SPMS Deliverables • Planning & Design Section
          </p>
        </div>

        {/* Action Controls & Semester Selector */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <StorageMonitorPill variant="compact" />

          {/* Semester Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-nia-600 shrink-0" />
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
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Daily Activities
          </Button>
        </div>
      </div>

      {/* Row 1: Executive KPI Strip (Clean, 4 Focused Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Target Realization */}
        <Card padding="md" className="border-l-4 border-l-nia-600 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Overall Accomplishment
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-900 font-mono">
                  {weightedAccomplishment}%
                </h3>
                <span className="text-xs font-bold text-emerald-700">SPMS Weighted</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-nia-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(weightedAccomplishment, 3)}%` }}
                />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-nia-50 text-nia-700 shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* 2. Completed Deliverables */}
        <Card padding="md" className="border-l-4 border-l-emerald-600 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Completed Outputs
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-emerald-900 font-mono">
                  {completedDeliverables}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  of {totalDeliverables} total
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                {completionRate}% finished and counted in IPCR
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* 3. Ongoing Work & Field Works */}
        <Card padding="md" className="border-l-4 border-l-sky-500 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                Active & Field Works
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-sky-900 font-mono">
                  {ongoingDeliverables}
                </h3>
                <span className="text-xs font-semibold text-emerald-700">
                  • {fieldWorkCount} Field Works
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                In-progress DEDs & SM7 field investigations
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 shrink-0">
              <Compass className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* 4. Target Goals Realized */}
        <Card padding="md" className="border-l-4 border-l-purple-600 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Commitment Targets
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-purple-900 font-mono">
                  {completedTargetsCount} / {commitments.length}
                </h3>
                <span className="text-xs font-bold text-purple-700">Targets 100%</span>
              </div>
              <p className="text-[11px] text-purple-700 font-medium mt-1">
                {commitments.length - completedTargetsCount === 0
                  ? 'All goals fulfilled!'
                  : `${commitments.length - completedTargetsCount} targets near completion`}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Visual Charts Hub (Clean Graphs, No Clutter!) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Monthly Deliverable Trajectory Bar Graph (7 cols) */}
        <Card padding="none" className="lg:col-span-7 flex flex-col shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4 text-nia-600" />
                  Monthly Output & Deliverable Velocity
                </CardTitle>
                <CardDescription>
                  Quantifiable completed deliverables and field works per month
                </CardDescription>
              </div>

              {/* Month filter reset if filtered */}
              {selectedMonthFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedMonthFilter('ALL')}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
                >
                  Clear Month Filter
                </button>
              )}
            </div>
          </CardHeader>

          <div className="p-5 flex-1 flex flex-col justify-between">
            {/* SVG Visual Column Chart */}
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 pt-6 px-2 border-b border-slate-200">
              {monthlyVelocity.map((m) => {
                const heightPct = Math.round((m.total / maxMonthTotal) * 100);
                const isSelected = selectedMonthFilter === m.monthKey;
                const completedRatio = m.total > 0 ? (m.completed / m.total) * 100 : 0;

                return (
                  <div
                    key={m.monthKey}
                    onClick={() => setSelectedMonthFilter(isSelected ? 'ALL' : m.monthKey)}
                    className="flex flex-col items-center gap-2 h-full justify-end cursor-pointer group select-none"
                    title={`${m.label}: ${m.completed} completed, ${m.ongoing} ongoing, ${m.fieldWorks} field works. Click to filter.`}
                  >
                    {/* Value Badge above column */}
                    <span
                      className={`text-[11px] font-bold font-mono transition-colors ${
                        isSelected
                          ? 'text-nia-800 font-black'
                          : m.total > 0
                          ? 'text-slate-600 group-hover:text-nia-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {m.total}
                    </span>

                    {/* Bar container */}
                    <div className="w-full max-w-[46px] bg-slate-100 rounded-t-xl h-full flex flex-col justify-end p-0.5 overflow-hidden transition-all group-hover:bg-slate-200/60">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 flex flex-col justify-end relative ${
                          isSelected
                            ? 'bg-nia-800 ring-2 ring-nia-500'
                            : 'bg-nia-600 group-hover:bg-nia-700'
                        }`}
                        style={{ height: `${Math.max(heightPct, 6)}%` }}
                      >
                        {/* Completed portion highlight */}
                        {m.completed > 0 && (
                          <div
                            className="bg-emerald-500 w-full rounded-t-lg transition-all"
                            style={{ height: `${completedRatio}%` }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Month Label */}
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isSelected
                          ? 'text-nia-900 underline underline-offset-4'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Completed Outputs
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-nia-600 inline-block" /> Ongoing Tasks
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Tip: Click any bar to isolate that month
              </span>
            </div>
          </div>
        </Card>

        {/* Right Chart: SPMS 3-Tier Visual Realization Matrix (5 cols) */}
        <Card padding="none" className="lg:col-span-5 flex flex-col shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-4 h-4 text-purple-600" />
              SPMS 3-Tier Objective Realization
            </CardTitle>
            <CardDescription>
              Strategic, Core & Support functions target completion
            </CardDescription>
          </CardHeader>

          <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
            {/* Tier 1: Strategic Priorities */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                    Tier I
                  </span>
                  <span className="font-bold text-slate-900">Strategic Priorities</span>
                  <span className="text-[10px] text-slate-400">(POWs & FSDE • 35%)</span>
                </div>
                <span className="font-mono font-bold text-xs text-purple-900">
                  {strategicStats.accomplished} / {strategicStats.target} ({strategicStats.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(strategicStats.percent, 3)}%` }}
                />
              </div>
            </div>

            {/* Tier 2: Core Functions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                    Tier II
                  </span>
                  <span className="font-bold text-slate-900">Core Functions</span>
                  <span className="text-[10px] text-slate-400">(Monitoring, Reports • 55%)</span>
                </div>
                <span className="font-mono font-bold text-xs text-blue-900">
                  {coreStats.accomplished} / {coreStats.target} ({coreStats.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(coreStats.percent, 3)}%` }}
                />
              </div>
            </div>

            {/* Tier 3: Support Functions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Tier III
                  </span>
                  <span className="font-bold text-slate-900">Support Functions</span>
                  <span className="text-[10px] text-slate-400">(Archiving, Routing • 10%)</span>
                </div>
                <span className="font-mono font-bold text-xs text-emerald-900">
                  {supportStats.accomplished} / {supportStats.target} ({supportStats.percent}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(supportStats.percent, 3)}%` }}
                />
              </div>
            </div>

            {/* Summary Rating Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-slate-700 font-semibold">
                  Projected IPCR Accomplishment:
                </span>
              </div>
              <span className="font-mono font-black text-sm text-slate-900">
                {weightedAccomplishment}% Score
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 3: Project Allocation Graph & Target Health Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Irrigation Project Work Distribution (6 cols) */}
        <Card padding="none" className="lg:col-span-6 shadow-xs flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderGit2 className="w-4 h-4 text-nia-600" />
              Work Allocation by Region XI Project
            </CardTitle>
            <CardDescription>
              Proportion of completed deliverables per irrigation system
            </CardDescription>
          </CardHeader>

          <div className="p-5 space-y-3.5 flex-1">
            {projectDistribution.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No project deliverables recorded for this period yet.
              </div>
            ) : (
              projectDistribution.map((item) => {
                const sharePct = totalDeliverables > 0
                  ? Math.round((item.count / totalDeliverables) * 100)
                  : 0;

                return (
                  <div key={item.project} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate max-w-[240px]">
                        {item.project}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">{item.completed} completed</span>
                        {item.fieldWorks > 0 && (
                          <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            🌾 {item.fieldWorks}
                          </span>
                        )}
                        <span className="text-slate-400 font-normal">({sharePct}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-nia-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(sharePct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right: Target Health & Quick Priority Focus (6 cols) */}
        <Card padding="none" className="lg:col-span-6 shadow-xs flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4 text-emerald-600" />
                IPCR Target Fulfillment Tracker
              </CardTitle>
              <button
                onClick={() => navigate('/accomplishment')}
                className="text-xs font-bold text-nia-700 hover:text-nia-900 flex items-center gap-1"
              >
                <span>View Full Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <CardDescription>
              Status of approved targets ({completedTargetsCount} of {commitments.length} fulfilled)
            </CardDescription>
          </CardHeader>

          <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-[300px] divide-y divide-slate-100">
            {targetHealth.map((t) => (
              <div key={t.commitment.id} className="pt-2 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        t.commitment.tier === 'STRATEGIC'
                          ? 'bg-purple-50 text-purple-900 border-purple-200'
                          : t.commitment.tier === 'CORE'
                          ? 'bg-blue-50 text-blue-900 border-blue-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {t.commitment.commitmentCode}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {t.commitment.mfoPap.replace(/^STRATEGIC MEASURE \d+\.\s*|^CORE FUNCTION \d+\s*MEASURE \d+\.\s*|^SF\d+\.\s*/i, '')}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      t.isCompleted ? 'text-emerald-700' : 'text-nia-700'
                    }`}
                  >
                    {t.actual} / {t.target} ({t.percent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      t.isCompleted ? 'bg-emerald-500' : 'bg-nia-500'
                    }`}
                    style={{ width: `${Math.max(t.percent, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Need to generate the official Form 13?
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/reports')}
              leftIcon={<FileCheck2 className="w-3.5 h-3.5" />}
            >
              Export IPCR Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
