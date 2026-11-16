import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const ImportPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const importSteps = [
    { number: 1, title: 'Upload Workbook', desc: 'Select .xlsx file' },
    { number: 2, title: 'Sheet Selection', desc: 'Pick sheets to parse' },
    { number: 3, title: 'Column Mapping', desc: 'Verify merged G:H ranges' },
    { number: 4, title: 'Validation & Deduplication', desc: 'Check records & dates' },
    { number: 5, title: 'Commit & History', desc: 'Apply historical tagging' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historical Data Ingestion & Import Wizard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Import existing approved IPCR commitments and historical daily log records • Preserves original workbooks and formatting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">Phase 2 Scheduled</Badge>
        </div>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {importSteps.map((step) => (
          <div
            key={step.number}
            onClick={() => setActiveStep(step.number)}
            className={`cursor-pointer p-3 rounded-xl border transition-all ${
              activeStep === step.number
                ? 'bg-nia-50 border-nia-400 ring-1 ring-nia-500 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activeStep === step.number
                    ? 'bg-nia-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {step.number}
              </span>
              <span className="text-xs font-semibold text-slate-800">{step.title}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 pl-8">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Target Workbooks Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source 1 */}
        <Card padding="md" className="border-l-4 border-l-nia-600">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-nia-600">
                Source 1 (Approved Commitments)
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Target Sheet: <strong className="text-slate-800">IPCR 2026</strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <Badge variant="slate">MFO/PAP</Badge>
                <Badge variant="slate">Success Indicators</Badge>
                <Badge variant="slate">Targets</Badge>
                <Badge variant="amber">Merged G:H Logic</Badge>
                <Badge variant="slate">Ratings & Remarks</Badge>
              </div>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-nia-600 shrink-0" />
          </div>
        </Card>

        {/* Source 2 */}
        <Card padding="md" className="border-l-4 border-l-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Source 2 (Daily Work & Correspondence)
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                SAM DAILY LOG SHEET.xlsx
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Target Sheets: <strong className="text-slate-800">DOC LOG SHEET, DAILY LOGSHEET, DOC RELEASE SHEET</strong>
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                <Badge variant="slate">Doc Correspondence</Badge>
                <Badge variant="slate">Dated Activities</Badge>
                <Badge variant="emerald">Calendar Cell Filter</Badge>
                <Badge variant="slate">Doc Releases</Badge>
              </div>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-emerald-600 shrink-0" />
          </div>
        </Card>
      </div>

      {/* Step Content Preview Box */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Pre-Import Verification Protocol
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict rules to guarantee historical data safety and prevent loss of original workbooks.
            </p>
          </div>
          <Badge variant="emerald">Non-Destructive Guarantee</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">1. Read-Only Ingestion</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Original Excel workbooks are parsed purely in-memory. The source files are never altered, overwritten, or relocated.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">2. Merged G:H Cells Handling</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Merged columns G and H for Actual Accomplishments are synthesized into a single cohesive logical string field.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">3. Rollback & Snapshot</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every import session automatically snapshots existing database states with full atomic rollback capability.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Import engine will be fully connected upon workbook provisioning in Phase 2.
          </span>
          <Button variant="secondary" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            View Past Import Runs
          </Button>
        </div>
      </Card>
    </div>
  );
};
