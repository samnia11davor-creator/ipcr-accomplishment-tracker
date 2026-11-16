import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/lib/utils';
import { MeasurementType } from '@/types';

export const CommitmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample approved commitments modeling SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx
  const sampleCommitments = [
    {
      id: 'com-001',
      commitmentCode: 'C-01',
      mfoPap: 'MFO 1: IRRIGATION SYSTEM DEVELOPMENT AND EXPANSION',
      successIndicator: 'Preparation and technical completion of Detailed Engineering Design (DED) for prioritized Irrigation Systems in Region XI.',
      target: '10 DED Design Packages completed and submitted within schedule.',
      measurementType: 'Count' as MeasurementType,
      allottedBudget: 1500000,
      accountableDivision: 'Planning and Design Section / Civil Engineer',
      actualAccomplishmentDraft: '8 of 10 DED design packages completed with approved hydraulic stability computations and structural CAD drawings.',
      sourceWorkbook: 'SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx',
      sourceCellRef: 'G14:H14 (Merged Cells)',
      isActive: true,
      currentCount: 8,
      targetCount: 10,
    },
    {
      id: 'com-002',
      commitmentCode: 'C-02',
      mfoPap: 'MFO 1: IRRIGATION SYSTEM DEVELOPMENT AND EXPANSION',
      successIndicator: 'Technical Review and Evaluation of Feasibility Studies submitted by contracted engineering firms.',
      target: '6 Feasibility Studies reviewed with technical evaluation reports.',
      measurementType: 'Count' as MeasurementType,
      allottedBudget: 850000,
      accountableDivision: 'Planning and Design Section',
      actualAccomplishmentDraft: '6 Feasibility studies technically evaluated and endorsed to Regional Office XI Management.',
      sourceWorkbook: 'SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx',
      sourceCellRef: 'G18:H18 (Merged Cells)',
      isActive: true,
      currentCount: 6,
      targetCount: 6,
    },
    {
      id: 'com-003',
      commitmentCode: 'C-03',
      mfoPap: 'MFO 2: IRRIGATION SYSTEM RESTORATION AND REHABILITATION',
      successIndicator: 'Conduct of Field Inspections and Verification of Proposed Canal Alignments and Headworks Sites.',
      target: '20 Field validation inspections conducted and documented with geotagged site reports.',
      measurementType: 'Quantity' as MeasurementType,
      allottedBudget: 420000,
      accountableDivision: 'Planning and Design Section',
      actualAccomplishmentDraft: '14 field validation inspections conducted across Davao del Norte, Davao del Sur, and Davao Oriental.',
      sourceWorkbook: 'SLT-IPCR-2ND-SEM-2026-JULY-DEC 2026-COMMITMENT_r2.xlsx',
      sourceCellRef: 'G22:H22 (Merged Cells)',
      isActive: true,
      currentCount: 14,
      targetCount: 20,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            IPCR Commitment Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central repository of approved IPCR commitments, success indicators, and baseline targets • Preserves original workbook text
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
            View Merged Cell Mapping
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Commitment
          </Button>
        </div>
      </div>

      {/* Cycle Selector & Information Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-nia-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Selected Cycle</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">2nd Semester 2026</div>
            <span className="text-[10px] text-slate-400">July 1, 2026 - December 31, 2026</span>
          </div>
          <Badge variant="blue">Active</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Source Reference</span>
            <div className="font-medium text-xs text-slate-800 mt-0.5 truncate max-w-[190px]">
              SLT-IPCR-2ND-SEM-2026...
            </div>
            <span className="text-[10px] text-slate-400">Sheet: IPCR 2026 (Merged G:H)</span>
          </div>
          <Badge variant="emerald">Source Linked</Badge>
        </Card>

        <Card padding="sm" className="p-4 flex items-center justify-between border-l-4 border-l-purple-600">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Commitments</span>
            <div className="font-bold text-sm text-slate-800 mt-0.5">14 Indicators</div>
            <span className="text-[10px] text-slate-400">Core Engineering & Support MFOs</span>
          </div>
          <Badge variant="purple">100% Tracked</Badge>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search commitments by MFO/PAP, indicator text, code, or measurement type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border-slate-200 focus:border-nia-500 focus:ring-nia-500 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Commitment Cards */}
      <div className="space-y-4">
        {sampleCommitments.map((com) => (
          <Card key={com.id} padding="md" className="border hover:border-slate-300 transition-all">
            {/* Top row: Code, MFO/PAP, Budget, Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-nia-700 text-white font-mono text-xs font-bold">
                  {com.commitmentCode}
                </span>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    {com.mfoPap}
                  </span>
                  <div className="text-xs text-slate-500 font-medium">
                    Accountable: {com.accountableDivision}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="cyan" size="sm">
                  Budget: {formatCurrency(com.allottedBudget)}
                </Badge>
                <Badge variant="slate" size="sm" className="font-mono text-[10px]">
                  Ref: {com.sourceCellRef}
                </Badge>
              </div>
            </div>

            {/* Core Indicator & Target */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Success Indicator (Approved Language)
                </span>
                <p className="text-xs text-slate-900 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {com.successIndicator}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Approved Target & Measure
                </span>
                <p className="text-xs text-slate-900 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {com.target}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>Measurement Type:</span>
                  <Badge variant="blue" size="sm">{com.measurementType}</Badge>
                </div>
              </div>
            </div>

            {/* Actual Accomplishment Draft (Merged G:H preview) */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  Actual Accomplishment Field (Merged G:H cells in Excel):
                </span>
                <span className="font-mono text-slate-500 text-[11px]">
                  Progress: {com.currentCount} / {com.targetCount}
                </span>
              </div>
              <p className="text-xs text-slate-800 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/60">
                "{com.actualAccomplishmentDraft}"
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
