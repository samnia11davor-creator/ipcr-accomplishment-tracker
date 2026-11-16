import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Target,
  FileCheck,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useApp } from '@/contexts/AppContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activities, commitments, documents, selectedPeriod, setSelectedPeriod } = useApp();

  const activeActivities = activities.filter((a) => !a.isDeleted);
  const totalCount = activeActivities.length;
  const completedCount = activeActivities.filter((a) => a.status === 'COMPLETED').length;
  const ongoingCount = activeActivities.filter((a) => a.status === 'ONGOING').length;
  const awaitingClassificationCount = activeActivities.filter(
    (a) => a.classificationStatus === 'PENDING'
  ).length;

  const activeDocuments = documents.filter((d) => !d.isDeleted);
  const pendingDocs = activeDocuments.filter((d) => d.status === 'Pending' || d.status === 'On-going');

  // Compute zero accomplishment commitments
  const zeroAccomplishments = commitments.filter((c) => {
    const acts = activeActivities.filter((a) => a.commitmentId === c.id && a.status === 'COMPLETED');
    return acts.length === 0;
  });

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Accomplishment Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Civil Engineering Work Monitoring & IPCR Target Realization • Planning and Design Section
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="SEM2">2nd Semester 2026 (Jul - Dec)</option>
              <option value="SEM1">1st Semester 2026 (Jan - Jun)</option>
              <option value="Q3">3rd Quarter 2026 (Jul - Sep)</option>
              <option value="Q4">4th Quarter 2026 (Oct - Dec)</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/activities')}
          >
            Record Activity
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Activities */}
        <Card padding="md" className="border-l-4 border-l-nia-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Activities</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Recorded this cycle</span>
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-nia-50 text-nia-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Completed Activities */}
        <Card padding="md" className="border-l-4 border-l-emerald-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Activities</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {completionRate}% execution rate
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Ongoing / In Progress */}
        <Card padding="md" className="border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ongoing Activities</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{ongoingCount}</h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">
                Active technical reviews & designs
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Awaiting Classification */}
        <Card padding="md" className="border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Classification</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{awaitingClassificationCount}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                {awaitingClassificationCount > 0 ? 'Action required in Activities' : 'All matched'}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active IPCR Commitments */}
        <Card padding="sm" className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500">Active Commitments</span>
              <p className="text-base font-bold text-slate-900">{commitments.length} Indicators</p>
            </div>
          </div>
          <Badge variant="blue">Active</Badge>
        </Card>

        {/* Zero Accomplishment Commitments */}
        <Card padding="sm" className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500">No Recorded Output</span>
              <p className="text-base font-bold text-rose-700">{zeroAccomplishments.length} Commitments</p>
            </div>
          </div>
          <Badge variant={zeroAccomplishments.length > 0 ? 'rose' : 'emerald'}>
            {zeroAccomplishments.length > 0 ? 'Requires Attention' : 'All Started'}
          </Badge>
        </Card>

        {/* Documents Pending Action */}
        <Card padding="sm" className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500">Documents Pending</span>
              <p className="text-base font-bold text-amber-800">{pendingDocs.length} Documents</p>
            </div>
          </div>
          <Badge variant={pendingDocs.length > 0 ? 'amber' : 'emerald'}>
            {pendingDocs.length > 0 ? 'Action Required' : 'Up to Date'}
          </Badge>
        </Card>
      </div>

      {/* Main Content Grid: Target Progress & Recent Validated Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress against Approved IPCR Targets (2 Cols) */}
        <Card padding="none" className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Progress Against IPCR Targets</CardTitle>
              <CardDescription>
                Live comparison of validated daily accomplishments against approved commitments
              </CardDescription>
            </div>
            <Badge variant="slate">{selectedPeriod} 2026</Badge>
          </CardHeader>

          <div className="p-5 divide-y divide-slate-100 space-y-4 max-h-[520px] overflow-y-auto">
            {commitments.map((com) => {
              const acts = activeActivities.filter(
                (a) => a.commitmentId === com.id && a.status === 'COMPLETED'
              );
              const count = acts.length;
              const targetNum = com.numericalTarget || 1;
              const pct = Math.min(100, Math.round((count / targetNum) * 100));

              return (
                <div key={com.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-nia-700 bg-nia-50 px-1.5 py-0.5 rounded border border-nia-200">
                        {com.commitmentCode}
                      </span>
                      <span className="truncate max-w-sm sm:max-w-md">{com.mfoPap}</span>
                    </span>
                    <span className={pct === 100 ? 'text-emerald-700 font-bold' : pct === 0 ? 'text-rose-600 font-bold' : 'text-slate-700 font-bold'}>
                      {count} / {com.numericalTarget} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        pct === 100 ? 'bg-emerald-600' : pct === 0 ? 'bg-rose-500' : 'bg-nia-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="truncate max-w-xs">{com.target}</span>
                    <span className={count === 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                      {count === 0 ? 'No recorded accomplishments yet' : `${acts.length} verified logs`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Pending Actions & Quick Actions (1 Col) */}
        <div className="space-y-4">
          <Card padding="none">
            <CardHeader>
              <div>
                <CardTitle>Documents Pending Action</CardTitle>
                <CardDescription>From DOC LOG SHEET requiring review</CardDescription>
              </div>
              <span className="text-xs font-bold text-amber-600">{pendingDocs.length} Items</span>
            </CardHeader>
            <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
              {pendingDocs.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No pending documents in queue.
                </div>
              ) : (
                pendingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1 hover:border-nia-300 transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span className="truncate max-w-[180px]">{doc.documentType}</span>
                      <Badge variant={doc.status === 'On-going' ? 'blue' : 'amber'} size="sm">
                        {doc.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{doc.description}</p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex justify-between">
                      <span>Rec: {doc.dateReceived}</span>
                      <span className="text-nia-800 font-medium">{doc.actionTaken.slice(0, 25)}...</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-br from-nia-900 to-slate-900 text-white">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Automated Report Engine
            </h4>
            <p className="text-xs text-slate-300 mt-2">
              All {totalCount} daily activities are mapped to IPCR commitments and ready for narrative synthesis and Excel/Word/PDF export.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-sky-300 font-medium">Draft Ready</span>
              <Button
                size="sm"
                variant="primary"
                className="bg-sky-500 hover:bg-sky-600 text-xs text-white"
                onClick={() => navigate('/reports')}
              >
                Open Report Generator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
