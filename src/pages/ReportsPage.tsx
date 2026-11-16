import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Sparkles,
  Printer,
  Save,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const ReportsPage: React.FC = () => {
  const [reportingPeriod, setReportingPeriod] = useState<string>('SEM2');
  const [selectedCommitment, setSelectedCommitment] = useState<string>('C-01');

  // Sample consolidated report draft
  const [narratives, setNarratives] = useState<Record<string, string>>({
    'C-01': 'Prepared and completed eight (8) Detailed Engineering Design (DED) packages for prioritized National and Communal Irrigation Systems in Region XI, including complete hydraulic stability calculations, canal cross-section profiles, structural foundation checks, and Bill of Quantities (BOQ), supported by approved design memoranda and CAD drawings.',
    'C-02': 'Conducted rigorous technical review and engineering evaluation of six (6) Feasibility Study (FS) reports submitted by engineering consulting firms, assessing hydrologic water availability, weir stability, geological borehole logs, and structural design criteria, resulting in official technical endorsement memoranda.',
    'C-03': 'Conducted and documented fourteen (14) comprehensive field validation inspections across irrigation systems in Davao del Sur and Davao del Norte to verify canal alignment, siphon cross-drainage clearances, and embankment stability, supported by geotagged site inspection reports.',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Automated Accomplishment Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidates validated daily activities into official IPCR accomplishment narratives and multi-format exports
          </p>
        </div>

        {/* Export Formats */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}>
            Export Excel (IPCR Format)
          </Button>
          <Button variant="outline" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-blue-600" />}>
            Export Word (.docx)
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Printer className="w-3.5 h-3.5 text-white" />}>
            Export PDF (Print)
          </Button>
        </div>
      </div>

      {/* Period & Generation Control Bar */}
      <Card padding="md" className="bg-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Target Reporting Cycle
            </span>
            <div className="flex items-center gap-3">
              <select
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                className="bg-slate-800 text-white text-xs font-semibold rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="SEM2">2nd Semester 2026 (July 1 - December 31, 2026)</option>
                <option value="SEM1">1st Semester 2026 (January 1 - June 30, 2026)</option>
                <option value="Q3">3rd Quarter 2026 (July - September 2026)</option>
                <option value="Q4">4th Quarter 2026 (October - December 2026)</option>
                <option value="CUSTOM">Custom Date Slicing...</option>
              </select>
              <Badge variant="blue" size="md">
                128 Activities Analyzed
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-300">Report Status: Ready for Review</div>
              <div className="text-[10px] text-slate-400">Last auto-synthesized: Today at 2:00 PM PHT</div>
            </div>
            <Button size="sm" variant="primary" className="bg-sky-500 hover:bg-sky-600 text-white text-xs" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Synthesize Narratives
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Review & Narrative Customization Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commitment List (1 Col) */}
        <Card padding="none" className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Commitment Breakdown</CardTitle>
            <Badge variant="slate">3 Active</Badge>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            <button
              onClick={() => setSelectedCommitment('C-01')}
              className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                selectedCommitment === 'C-01' ? 'bg-nia-50/80 border-l-4 border-l-nia-600' : 'hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-nia-700">C-01</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Detailed Engineering Design (DED)
                </p>
                <span className="text-[11px] text-slate-500">8 of 10 completed • 32 daily logs</span>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedCommitment('C-02')}
              className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                selectedCommitment === 'C-02' ? 'bg-nia-50/80 border-l-4 border-l-nia-600' : 'hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-nia-700">C-02</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Technical Review of Feasibility Studies
                </p>
                <span className="text-[11px] text-slate-500">6 of 6 completed • 18 daily logs</span>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>

            <button
              onClick={() => setSelectedCommitment('C-03')}
              className={`w-full p-4 text-left transition-colors flex items-start justify-between ${
                selectedCommitment === 'C-03' ? 'bg-nia-50/80 border-l-4 border-l-nia-600' : 'hover:bg-slate-50'
              }`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-nia-700">C-03</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  Field Inspection & Site Validation
                </p>
                <span className="text-[11px] text-slate-500">14 of 20 completed • 22 daily logs</span>
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            </button>
          </div>
        </Card>

        {/* Narrative Editor & Excel Target Cell Preview (2 Cols) */}
        <Card padding="md" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-nia-100 text-nia-800">
                  {selectedCommitment}
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  Accomplishment Narrative Editor
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Populates the <strong>Actual Accomplishment (Merged G:H)</strong> column in official IPCR.
              </p>
            </div>

            <Button variant="outline" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save Narrative
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Standard Civil Engineering Narrative Formulation:</span>
              <span className="text-[11px] text-slate-400 font-normal">Editable by User</span>
            </label>
            <textarea
              rows={5}
              value={narratives[selectedCommitment] || ''}
              onChange={(e) =>
                setNarratives({ ...narratives, [selectedCommitment]: e.target.value })
              }
              className="w-full text-xs leading-relaxed rounded-lg border-slate-300 focus:border-nia-500 focus:ring-nia-500 p-3 bg-white shadow-sm"
            />
          </div>

          {/* Excel Preview Block */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Excel Target Destination: Merged Cells G14:H14
              </span>
              <span className="text-slate-400">Target Workbook: SLT-IPCR-2ND-SEM-2026...</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-tight italic">
              "The above narrative will be formatted directly into the pre-approved IPCR workbook template without altering merged cell topologies, formulas, or budgetary columns."
            </p>
          </div>

          {/* User Sign-Off */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-nia-600 focus:ring-nia-500 w-4 h-4" />
              <span className="text-xs font-medium text-slate-700">
                User Approved (Verified against supporting memos & BOQ calculations)
              </span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Status: USER_VERIFIED</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
