import React, { useState } from 'react';
import {
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Target,
  FileCheck,
  TrendingUp,
  Filter,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export const DashboardPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('SEM2');

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

          <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
            Advanced Filters
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
              <h3 className="text-2xl font-bold text-slate-900 mt-1">128</h3>
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
              <h3 className="text-2xl font-bold text-slate-900 mt-1">94</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                73.4% execution rate
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
              <h3 className="text-2xl font-bold text-slate-900 mt-1">26</h3>
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
              <h3 className="text-2xl font-bold text-amber-700 mt-1">8</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Ready for IPCR matching
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
              <p className="text-base font-bold text-slate-900">14 Indicators</p>
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
              <p className="text-base font-bold text-rose-700">2 Commitments</p>
            </div>
          </div>
          <Badge variant="rose">Requires Attention</Badge>
        </Card>

        {/* Documents Pending Action */}
        <Card padding="sm" className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-500">Documents Pending</span>
              <p className="text-base font-bold text-amber-800">5 Documents</p>
            </div>
          </div>
          <Badge variant="amber">Action Required</Badge>
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
            <Badge variant="slate">2nd Sem 2026</Badge>
          </CardHeader>

          <div className="p-5 divide-y divide-slate-100 space-y-4">
            {/* Target Item 1 */}
            <div className="pt-2 first:pt-0">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-nia-700 bg-nia-50 px-1.5 py-0.5 rounded border border-nia-200">
                    C-01
                  </span>
                  Detailed Engineering Design (DED) of Irrigation Projects
                </span>
                <span className="text-slate-600">8 / 10 Designs (80%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-nia-600 h-2.5 rounded-full transition-all" style={{ width: '80%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Measurement: Count (DED Documents Completed)</span>
                <span>Target: 10 Projects</span>
              </div>
            </div>

            {/* Target Item 2 */}
            <div className="pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-nia-700 bg-nia-50 px-1.5 py-0.5 rounded border border-nia-200">
                    C-02
                  </span>
                  Technical Review of Feasibility Studies (FS)
                </span>
                <span className="text-emerald-700">6 / 6 Studies (100%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-600 h-2.5 rounded-full transition-all" style={{ width: '100%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Measurement: Count (Evaluation Reports Submitted)</span>
                <span className="text-emerald-600 font-semibold">Target Completed</span>
              </div>
            </div>

            {/* Target Item 3 */}
            <div className="pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-nia-700 bg-nia-50 px-1.5 py-0.5 rounded border border-nia-200">
                    C-03
                  </span>
                  Field Inspection and Dam/Canal Alignment Validation
                </span>
                <span className="text-slate-600">14 / 20 Inspections (70%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-nia-600 h-2.5 rounded-full transition-all" style={{ width: '70%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Measurement: Quantity (Site Inspection Reports with Geo-tagged photos)</span>
                <span>Target: 20 Inspections</span>
              </div>
            </div>

            {/* Target Item 4 (Zero Accomplishment alert) */}
            <div className="pt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    C-05
                  </span>
                  Preparation of Annual Irrigation Program of Works (POW)
                </span>
                <span className="text-rose-600">0 / 4 Programs (0%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-rose-500 h-2.5 rounded-full transition-all" style={{ width: '0%' }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Measurement: Quantity (Consolidated Section Program)</span>
                <span className="text-rose-600 font-medium">No recorded activities yet</span>
              </div>
            </div>
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
              <span className="text-xs font-bold text-amber-600">5 Items</span>
            </CardHeader>
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Letter: Endorsement of POW</span>
                  <Badge variant="amber" size="sm">Pending</Badge>
                </div>
                <p className="text-[11px] text-slate-600">Davao del Norte IMO • Digos RIS Canal Lining</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-100 flex justify-between">
                  <span>Rec: Nov 14, 2026</span>
                  <span className="text-amber-800 font-medium">Action: Technical Review</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Memo: Feasibility Study Submission</span>
                  <Badge variant="blue" size="sm">On-going</Badge>
                </div>
                <p className="text-[11px] text-slate-600">Regional Manager Office • Padada River Dam Study</p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-blue-100 flex justify-between">
                  <span>Rec: Nov 11, 2026</span>
                  <span className="text-blue-800 font-medium">Action: Review Hydraulic Calc</span>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-br from-nia-900 to-slate-900 text-white">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-400" />
              Semiannual Report Status
            </h4>
            <p className="text-xs text-slate-300 mt-2">
              All daily activities encoded in this tracker are continually matched with IPCR targets.
              Generate a snapshot report anytime.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-sky-300 font-medium">2nd Sem Draft: Ready</span>
              <Button size="sm" variant="primary" className="bg-sky-500 hover:bg-sky-600 text-xs">
                Draft Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
